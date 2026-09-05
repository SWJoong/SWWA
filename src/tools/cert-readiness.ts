import { readFileSync } from "node:fs";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataBundle } from "../data/loader.js";
import { estimateCertReadiness, type CertInputReport } from "../report/cert.js";

const MAX_REPORTS = 50;

// 입력 Report는 checkpoints[].{id,status}만 있으면 된다(느슨하게 받되 형태는 검증한다).
const inputReportSchema = z.object({
  checkpoints: z
    .array(
      z.object({
        id: z.string(),
        status: z.enum(["fail", "incomplete", "manual", "pass", "na"]),
      }),
    )
    .min(1),
});

function errorResult(code: string, message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
    structuredContent: { code },
  };
}

export function registerCertReadinessTool(server: McpServer, data: DataBundle): void {
  server.registerTool(
    "estimate_cert_readiness",
    {
      title: "인증 준비도 추정",
      description:
        "여러 페이지의 검사 Report를 검사항목별 준수율로 집계해 웹 접근성 품질인증 준비도를 추정한다. 자동 검사만으로 인증 통과를 판정하지 않으며 수동·사용자 심사 잔여를 함께 알린다.",
      inputSchema: {
        reports: z.array(z.unknown()).max(MAX_REPORTS).optional().describe("check_html·audit_url의 Report 배열(reportPaths와 택1)"),
        reportPaths: z.array(z.string()).max(MAX_REPORTS).optional().describe("Report JSON 파일 경로 배열(reports와 택1)"),
        pageCount: z.number().int().positive().optional().describe("표본 총 페이지 수(미지정 시 report 수)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ reports, reportPaths, pageCount }) => {
      if ((reports === undefined) === (reportPaths === undefined)) {
        return errorResult("E_INPUT", "reports와 reportPaths 중 정확히 하나만 지정하세요.");
      }

      let rawReports: unknown[];
      if (reports !== undefined) {
        rawReports = reports;
      } else {
        rawReports = [];
        for (const path of reportPaths as string[]) {
          let json: unknown;
          try {
            json = JSON.parse(readFileSync(path, "utf8"));
          } catch {
            return errorResult("E_NOT_FOUND", `Report 파일을 읽을 수 없습니다: ${path}`);
          }
          rawReports.push(json);
        }
      }

      if (rawReports.length === 0) return errorResult("E_INPUT", "집계할 Report가 없습니다.");
      if (rawReports.length > MAX_REPORTS) return errorResult("E_INPUT", `Report는 최대 ${MAX_REPORTS}건입니다.`);

      const parsed: CertInputReport[] = [];
      for (const raw of rawReports) {
        const result = inputReportSchema.safeParse(raw);
        if (!result.success) {
          return errorResult("E_INPUT", "Report 형식이 올바르지 않습니다(checkpoints[].id·status 필요).");
        }
        parsed.push(result.data);
      }

      const readiness = estimateCertReadiness(parsed, pageCount, data);
      const text = [
        `인증 준비도(추정): 자동 검사 커버리지 ${Math.round(readiness.overall.autoCheckedCoverage * 100)}% · 추정 전문가 준수율 ${Math.round(readiness.overall.estimatedExpertRate * 100)}% · 표본 ${readiness.overall.pagesAudited}p`,
        readiness.gaps.length > 0
          ? `우선 조치(${readiness.gaps.length}): ${readiness.gaps.slice(0, 5).map((g) => `${g.id}(${g.failingPages}p)`).join(", ")}`
          : "자동 등급 항목에서 기준 미달 항목 없음",
        `수동·사용자 심사 잔여 ${readiness.manualRemaining.length}항목`,
        ...readiness.notices.map((n) => `- ${n}`),
      ].join("\n");

      return { content: [{ type: "text" as const, text }], structuredContent: { ...readiness } };
    },
  );
}
