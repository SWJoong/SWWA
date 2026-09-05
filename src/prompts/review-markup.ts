import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * review-markup 프롬프트(FR-08, 02 §3.2). check_html 호출 → 결과를 6.4.1(2.4.1) 형식으로 인용하며
 * before/after 수정안, 자동/보조/수동 구분, 수동 확인 목록, "심사 전 참고 결과" 고지까지 지시한다.
 */
export function registerReviewMarkupPrompt(server: McpServer): void {
  server.registerPrompt(
    "review-markup",
    {
      title: "마크업 접근성 검토",
      description: "웹 UI 코드를 KWCAG 2.2 기준으로 검토하는 지시를 만든다. check_html 호출과 검사항목 인용·수정안 제시를 포함한다.",
      argsSchema: {
        html: z.string().min(1).describe("검토할 HTML/코드"),
        framework: z.enum(["html", "react", "vue", "svelte"]).optional().describe("프레임워크(선택)"),
        focus: z.string().optional().describe("집중할 검사항목 ID 콤마 목록(선택, 예: 6.4.1,7.3.2)"),
      },
    },
    ({ html, framework, focus }) => {
      const parts = [
        "당신은 KWCAG 2.2(한국형 웹 콘텐츠 접근성 지침) 심사관입니다. 아래 코드의 접근성을 검토하고 수정안을 제시하세요.",
        "",
        "## 검토 방법",
        "1. `check_html` 도구를 호출해 정적 검사 결과(Report)를 받습니다.",
        "2. 발견한 문제는 검사항목을 **공식 번호(별칭)** 형식 `6.4.1(2.4.1)`으로 인용해 지적합니다.",
        "3. 문제마다 before/after 코드로 구체적인 수정안을 제시합니다" +
          (framework && framework !== "html" ? ` (${framework} 관례에 맞게).` : "."),
        "4. 각 항목을 **자동/보조/수동** 판정으로 구분해 설명합니다(자동 검사가 확정한 것과 사람이 확인해야 하는 것을 분리).",
        "5. Report의 `manualChecklist`를 바탕으로 **수동 확인이 필요한 항목**을 목록으로 정리합니다.",
        "6. 렌더링이 필요한 항목(명도 대비·초점 표시·타깃 크기)은 `audit_url` 브라우저 감사로 보완하도록 안내합니다.",
      ];
      if (focus && focus.trim().length > 0) {
        parts.push("", `## 집중 검토 항목`, `다음 검사항목을 특히 자세히 다루세요: ${focus}`);
      }
      parts.push(
        "",
        "## 고지",
        "자동 검사 결과는 전문가·사용자 심사 전 참고 결과이며, 인증 통과 여부를 판정하지 않습니다.",
        "",
        "## 검토할 코드",
        "```" + (framework ?? "html"),
        html,
        "```",
      );
      return { messages: [{ role: "user", content: { type: "text", text: parts.join("\n") } }] };
    },
  );
}
