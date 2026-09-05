import { readFileSync, statSync } from "node:fs";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataBundle } from "../data/loader.js";
import { runStatic, EngineTimeoutError } from "../engine/static.js";
import { summarize } from "../report/summarize.js";
import { formatReportText } from "../report/format.js";
import type { Report } from "../report/types.js";
import { reportOutputShape } from "./report-schema.js";

const MAX_HTML_CHARS = 2_000_000;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_FINDINGS = 200;

function errorResult(code: string, message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
    structuredContent: { code },
  };
}

export function registerCheckHtmlTool(server: McpServer, data: DataBundle): void {
  server.registerTool(
    "check_html",
    {
      title: "HTML 정적 접근성 검사",
      description:
        "HTML 문자열이나 로컬 HTML 파일을 KWCAG 2.2 기준으로 정적 검사한다. 웹 UI 코드를 작성·수정·리뷰할 때 반드시 호출한다. 브라우저 없이 동작하며, 렌더링이 필요한 항목(명도 대비·초점 표시·타깃 크기)은 '브라우저 감사 필요'로 표시한다.",
      inputSchema: {
        html: z.string().optional().describe("검사할 HTML 문자열(path와 택1)"),
        path: z.string().optional().describe("로컬 .html/.htm 파일 경로(html과 택1)"),
        baseUrl: z.string().optional().describe("상대 링크·#target 해석용"),
        ruleset: z.enum(["kwcag22", "wcag22aa"]).default("kwcag22"),
        excludeRules: z.array(z.string()).optional().describe("제외할 axe·k 규칙 ID"),
        maxFindings: z.number().int().positive().default(DEFAULT_MAX_FINDINGS),
      },
      outputSchema: reportOutputShape,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ html, path, baseUrl, ruleset, excludeRules, maxFindings }) => {
      if ((html === undefined) === (path === undefined)) {
        return errorResult("E_INPUT", "html과 path 중 정확히 하나만 지정하세요.");
      }

      let source: string;
      let targetKind: Report["target"]["kind"];
      let targetRef: string;

      if (html !== undefined) {
        if (html.length === 0) return errorResult("E_INPUT", "html이 비어 있습니다.");
        if (html.length > MAX_HTML_CHARS) return errorResult("E_SIZE", `html이 ${MAX_HTML_CHARS}자를 초과합니다.`);
        source = html;
        targetKind = "html";
        targetRef = "(inline html)";
      } else {
        const filePath = path as string;
        let stat;
        try {
          stat = statSync(filePath);
        } catch {
          return errorResult("E_NOT_FOUND", `파일을 찾을 수 없습니다: ${filePath}`);
        }
        if (stat.size > MAX_FILE_BYTES) return errorResult("E_SIZE", "파일이 2MB를 초과합니다.");
        source = readFileSync(filePath, "utf8");
        targetKind = "file";
        targetRef = filePath;
      }

      let engineResult;
      try {
        engineResult = await runStatic({ html: source, baseUrl, ruleset, excludeRules, data });
      } catch (err) {
        if (err instanceof EngineTimeoutError) return errorResult("E_TIMEOUT", "정적 검사 시간이 초과되었습니다.");
        return errorResult("E_INTERNAL", "정적 검사 중 오류가 발생했습니다.");
      }

      const { verdict, summary, checkpoints, findings, manualChecklist, notices } = summarize(
        engineResult.findings,
        "static",
        data,
        maxFindings,
      );

      const report = {
        engine: { name: "swwa", version: "0.1.0", axe: "4.13.0", mode: "static" },
        target: { kind: targetKind, ref: targetRef, title: engineResult.title },
        verdict,
        summary,
        checkpoints,
        findings,
        manualChecklist,
        notices: [...engineResult.notices, ...notices],
      } satisfies Report;

      return {
        content: [{ type: "text" as const, text: formatReportText(report) }],
        structuredContent: report,
      };
    },
  );
}
