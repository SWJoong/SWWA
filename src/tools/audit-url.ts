import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataBundle } from "../data/loader.js";
import { assertUrlAllowed, BlockedUrlError } from "../engine/url-guard.js";
import { runBrowser, NoBrowserError, NavigationError, BrowserTimeoutError } from "../engine/browser.js";
import { summarize } from "../report/summarize.js";
import { formatReportText } from "../report/format.js";
import type { Report } from "../report/types.js";
import { reportOutputShape } from "./report-schema.js";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_FINDINGS = 200;

function errorResult(code: string, message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
    structuredContent: { code },
  };
}

export function registerAuditUrlTool(server: McpServer, data: DataBundle): void {
  server.registerTool(
    "audit_url",
    {
      title: "브라우저 접근성 감사",
      description:
        "실제 브라우저로 URL을 열어 KWCAG 2.2 기준 감사(axe + 초점·타깃 크기·본문 바로가기 등 동적 검사)를 수행한다. 사이트 점검·인증 준비 시 호출한다. 먼저 browser_status로 브라우저 가용성을 확인하라.",
      inputSchema: {
        url: z.string().min(1).describe("http/https/file. localhost 허용, 링크로컬·메타데이터 호스트 차단"),
        viewport: z.enum(["desktop", "mobile"]).default("desktop"),
        waitFor: z.string().default("load").describe('"load" | "networkidle" | CSS 셀렉터'),
        timeoutMs: z.number().int().positive().max(MAX_TIMEOUT_MS).default(DEFAULT_TIMEOUT_MS),
        checks: z.array(z.enum(["axe", "b-rules", "keyboard"])).optional().describe("기본 전부"),
        screenshot: z.boolean().default(false),
        outputDir: z.string().optional().describe("지정 시 스크린샷 저장(경로만 반환)"),
        headers: z.record(z.string(), z.string()).optional(),
        excludeRules: z.array(z.string()).optional(),
        maxFindings: z.number().int().positive().default(DEFAULT_MAX_FINDINGS),
      },
      outputSchema: {
        ...reportOutputShape,
        meta: z.object({
          finalUrl: z.string(),
          title: z.string().optional(),
          viewport: z.enum(["desktop", "mobile"]),
          browser: z.object({ channel: z.string(), version: z.string() }),
          durationMs: z.number(),
          screenshotPath: z.string().optional(),
        }),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ url, viewport, waitFor, timeoutMs, checks, screenshot, outputDir, headers, excludeRules, maxFindings }) => {
      let parsedUrl;
      try {
        parsedUrl = assertUrlAllowed(url);
      } catch (err) {
        if (err instanceof BlockedUrlError) return errorResult("E_BLOCKED_URL", err.message);
        throw err;
      }

      const start = Date.now();
      let engineResult;
      try {
        engineResult = await runBrowser({
          url: parsedUrl.href,
          viewport,
          waitFor,
          timeoutMs,
          checks,
          headers,
          excludeRules,
          screenshot,
          outputDir,
          data,
        });
      } catch (err) {
        if (err instanceof NoBrowserError) return errorResult("E_NO_BROWSER", err.message);
        if (err instanceof BrowserTimeoutError) return errorResult("E_TIMEOUT", err.message);
        if (err instanceof NavigationError) return errorResult("E_NAV", err.message);
        return errorResult("E_INTERNAL", "브라우저 감사 중 오류가 발생했습니다.");
      }
      const durationMs = Date.now() - start;

      const { verdict, summary, checkpoints, findings, manualChecklist, notices } = summarize(
        engineResult.findings,
        "browser",
        data,
        maxFindings,
      );

      const report = {
        engine: { name: "swwa", version: "0.1.0", axe: "4.13.0", mode: "browser" },
        target: { kind: "url", ref: parsedUrl.href, title: engineResult.title },
        verdict,
        summary,
        checkpoints,
        findings,
        manualChecklist,
        notices,
      } satisfies Report;

      const structuredContent = {
        ...report,
        meta: {
          finalUrl: engineResult.finalUrl,
          title: engineResult.title,
          viewport,
          browser: engineResult.browser,
          durationMs,
          screenshotPath: engineResult.screenshotPath,
        },
      };

      return {
        content: [{ type: "text" as const, text: formatReportText(report) }],
        structuredContent,
      };
    },
  );
}
