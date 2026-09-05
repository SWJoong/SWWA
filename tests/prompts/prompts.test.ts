import { connectClient } from "../tools/tool-harness.js";

function firstText(messages: { content: { type: string; text?: string } }[]): string {
  return messages.map((m) => (m.content.type === "text" ? m.content.text ?? "" : "")).join("\n");
}

describe("프롬프트 (InMemory 계약, FR-08)", () => {
  it("TC-PROMPT-01: prompts/list에 review-markup·audit-report가 노출된다", async () => {
    const client = await connectClient();
    const { prompts } = await client.listPrompts();
    const names = prompts.map((p) => p.name);
    expect(names).toContain("review-markup");
    expect(names).toContain("audit-report");
  });

  it("TC-PROMPT-02: review-markup은 check_html 호출과 검사항목 인용·수정안 지시를 담는다", async () => {
    const client = await connectClient();
    const res = await client.getPrompt({
      name: "review-markup",
      arguments: { html: "<img src=x.png>", framework: "react", focus: "5.1.1" },
    });
    const text = firstText(res.messages);
    expect(text).toContain("check_html");
    expect(text).toContain("6.4.1(2.4.1)");
    expect(text).toContain("5.1.1"); // focus 반영
    expect(text).toContain("<img src=x.png>");
    expect(text).toContain("참고 결과"); // 심사 전 참고 결과 고지
  });

  it("TC-PROMPT-03: review-markup은 필수 인자 html이 없으면 거부한다", async () => {
    const client = await connectClient();
    await expect(client.getPrompt({ name: "review-markup", arguments: {} })).rejects.toBeDefined();
  });

  it("TC-PROMPT-04: audit-report는 보고서 형식(33항목 판정표·인증 준비도·면책)을 지시한다", async () => {
    const client = await connectClient();
    const res = await client.getPrompt({
      name: "audit-report",
      arguments: { siteName: "우리동네예산", reportJson: '{"verdict":"fail"}', audience: "certification" },
    });
    const text = firstText(res.messages);
    expect(text).toContain("우리동네예산");
    expect(text).toContain("33개 검사항목 판정표");
    expect(text).toContain("estimate_cert_readiness");
    expect(text).toContain("면책");
    expect(text).toContain("인증"); // certification audience note
  });
});
