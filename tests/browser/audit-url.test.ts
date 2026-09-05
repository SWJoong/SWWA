import { connectClient } from "../tools/tool-harness.js";
import { fixtureUrl, describeBrowser } from "./browser-harness.js";

interface ReportLike {
  engine: { mode: string };
  verdict: string;
  checkpoints: { id: string; status: string }[];
}

describe("audit_url 도구 (InMemory 계약)", () => {
  it("TC-TOOL-AUDIT-URL-01: tools/list에 노출되고 입력·출력 스키마를 갖는다", async () => {
    const client = await connectClient();
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "audit_url");
    expect(tool).toBeDefined();
    expect(tool?.inputSchema).toBeDefined();
    expect(tool?.outputSchema).toBeDefined();
  });

  it("TC-TOOL-AUDIT-URL-02: 링크-로컬·메타데이터 호스트는 브라우저 없이도 E_BLOCKED_URL이다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "audit_url",
      arguments: { url: "http://169.254.169.254/latest/meta-data/" },
    });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_BLOCKED_URL");
  });
});

await describeBrowser("audit_url 도구 — 실제 브라우저 감사", () => {
  it(
    "TC-TOOL-AUDIT-URL-03: 정상 픽스처 페이지를 감사하면 33개 검사항목 상태표를 포함한다",
    async () => {
      const client = await connectClient();
      const url = await fixtureUrl("b-skip-link-works-pass.html");
      const res = await client.callTool({ name: "audit_url", arguments: { url, timeoutMs: 20000 } });
      const report = res.structuredContent as ReportLike;
      expect(report.engine.mode).toBe("browser");
      expect(report.checkpoints.length).toBe(33);
      expect(["fail", "needs-review", "pass"]).toContain(report.verdict);
    },
    15_000, // b-motion-runtime 기본 관찰 시간(5초) + axe 실행 여유
  );
});
