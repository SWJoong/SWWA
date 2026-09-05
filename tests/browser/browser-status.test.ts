import { connectClient } from "../tools/tool-harness.js";

describe("browser_status 도구 (InMemory 계약)", () => {
  it("TC-TOOL-BROWSER-STATUS-01: tools/list에 노출되고 입력·출력 스키마를 갖는다", async () => {
    const client = await connectClient();
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "browser_status");
    expect(tool).toBeDefined();
    expect(tool?.inputSchema).toBeDefined();
    expect(tool?.outputSchema).toBeDefined();
  });

  it("TC-TOOL-BROWSER-STATUS-02: available 여부와 무관하게 installHint를 포함한 구조로 응답한다", async () => {
    const client = await connectClient();
    const res = await client.callTool({ name: "browser_status", arguments: {} });
    const out = res.structuredContent as { available: boolean; channel: string | null; installHint: string };
    expect(typeof out.available).toBe("boolean");
    expect(typeof out.installHint).toBe("string");
    if (out.available) {
      expect(["chrome", "msedge", "chromium"]).toContain(out.channel);
    } else {
      expect(out.channel).toBeNull();
    }
  });
});
