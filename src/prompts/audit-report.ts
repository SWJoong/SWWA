import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * audit-report 프롬프트(FR-08, 02 §3.2). skills/a11y-audit/references/report-template.md 형식으로
 * 요약 → 33항목 판정표 → 우선순위 조치 → 수동·사용자 심사 잔여 → 인증 준비도 → 면책 고지 순서의
 * 보고서를 작성하도록 지시한다.
 */
export function registerAuditReportPrompt(server: McpServer): void {
  server.registerPrompt(
    "audit-report",
    {
      title: "감사 보고서 작성",
      description: "검사 Report(JSON)로부터 KWCAG 2.2 감사 보고서를 작성하는 지시를 만든다. 33항목 판정표·우선순위 조치·인증 준비도·면책 고지를 포함한다.",
      argsSchema: {
        siteName: z.string().min(1).describe("대상 사이트/서비스 이름"),
        reportJson: z.string().min(1).describe("check_html·audit_url의 Report JSON(1개 또는 배열)"),
        audience: z.enum(["developer", "manager", "certification"]).optional().describe("독자(선택)"),
      },
    },
    ({ siteName, reportJson, audience }) => {
      const aud = audience ?? "developer";
      const audienceNote: Record<string, string> = {
        developer: "개발자 대상: 코드 수정안·선택자·before/after를 중심으로 작성하세요.",
        manager: "관리자 대상: 우선순위·공수·리스크 요약을 중심으로, 코드는 최소화하세요.",
        certification: "인증 담당 대상: 33항목 판정표·준수율·잔여 심사 항목을 중심으로 근거·출처를 명시하세요.",
      };
      const parts = [
        `당신은 KWCAG 2.2 심사관입니다. 아래 검사 결과로 "${siteName}"의 웹 접근성 감사 보고서를 작성하세요.`,
        "",
        "## 작성 형식 (skills/a11y-audit/references/report-template.md)",
        "1. **요약** — 대상·표본 수·종합 판정(실패/검토 필요/통과)과 한 문장 근거, 자동 검사 커버리지(추정치임을 명시)",
        "2. **33개 검사항목 판정표** — 검사항목을 `6.4.1(2.4.1)` 형식으로, 자동화 등급·상태·비고",
        "3. **우선순위 조치** — 자동·보조 등급 항목 중 준수율 낮은 순, 영향·수정안",
        "4. **수동·사용자 심사 잔여** — 사람이 확인해야 하는 항목(검사항목 ID + 확인 질문), 장애 유형별 과업 예시",
        "5. **인증 준비도** — 여러 페이지면 `estimate_cert_readiness`를 호출해 준수율·gaps·manualRemaining을 반영. 품질인증 기준 수치는 인증기관 공지로 재확인 필요임을 명시",
        "6. **면책 고지** — 자동 판정은 전문가·사용자 심사를 대체하지 않는 참고 결과임을 명시",
        "",
        `## 독자`,
        audienceNote[aud],
        "",
        "## 검사 결과(Report JSON)",
        "```json",
        reportJson,
        "```",
      ];
      return { messages: [{ role: "user", content: { type: "text", text: parts.join("\n") } }] };
    },
  );
}
