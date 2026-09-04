import { connectClient } from "./tool-harness.js";

describe("check_contrast 도구 (InMemory 계약)", () => {
  it("TC-TOOL-CHECK-CONTRAST-01: tools/list에 노출되고 입력·출력 스키마를 갖는다", async () => {
    const client = await connectClient();
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "check_contrast");
    expect(tool).toBeDefined();
    expect(tool?.inputSchema).toBeDefined();
    expect(tool?.outputSchema).toBeDefined();
  });

  it("TC-TOOL-CHECK-CONTRAST-02: 검정/흰색은 AA·AAA를 모두 통과하고 5.4.3(1.4.3)을 인용한다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "check_contrast",
      arguments: { foreground: "#000000", background: "#ffffff" },
    });
    const out = res.structuredContent as { aa: string; aaa: string; kwcag: string; alias: string };
    expect(out.aa).toBe("pass");
    expect(out.aaa).toBe("pass");
    expect(out.kwcag).toBe("5.4.3");
    expect(out.alias).toBe("1.4.3");
  });

  it("TC-TOOL-CHECK-CONTRAST-03: 기준 미달 색상은 aa=fail이다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "check_contrast",
      arguments: { foreground: "#cccccc", background: "#ffffff" },
    });
    expect((res.structuredContent as { aa: string }).aa).toBe("fail");
  });

  it("TC-TOOL-CHECK-CONTRAST-04: 잘못된 색상 표기는 E_INPUT으로 isError를 돌려준다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "check_contrast",
      arguments: { foreground: "not-a-color", background: "#ffffff" },
    });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_INPUT");
  });
});
