import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { connectClient } from "./tool-harness.js";

function fixture(ruleId: string, name: string): string {
  return readFileSync(fileURLToPath(new URL(`../fixtures/html/${ruleId}/${name}`, import.meta.url)), "utf8");
}

interface ReportLike {
  engine: { mode: string };
  verdict: string;
  checkpoints: { id: string; status: string }[];
  findings: unknown[];
}

describe("check_html 도구 (InMemory 계약)", () => {
  it("TC-TOOL-CHECK-HTML-01: tools/list에 노출되고 입력·출력 스키마를 갖는다", async () => {
    const client = await connectClient();
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "check_html");
    expect(tool).toBeDefined();
    expect(tool?.inputSchema).toBeDefined();
    expect(tool?.outputSchema).toBeDefined();
  });

  it("TC-TOOL-CHECK-HTML-02: 본문 바로가기 링크가 없는 페이지는 6.4.1이 fail이고 verdict가 fail이다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "check_html",
      arguments: { html: fixture("k-skip-link-first", "fail.html") },
    });
    const report = res.structuredContent as ReportLike;
    expect(report.engine.mode).toBe("static");
    expect(report.checkpoints.length).toBe(33);
    expect(report.checkpoints.find((c) => c.id === "6.4.1")?.status).toBe("fail");
    expect(report.verdict).toBe("fail");
  });

  it("TC-TOOL-CHECK-HTML-03: html·path를 둘 다 안 주면 E_INPUT이다", async () => {
    const client = await connectClient();
    const res = await client.callTool({ name: "check_html", arguments: {} });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_INPUT");
  });

  it("TC-TOOL-CHECK-HTML-04: html·path를 둘 다 주면 E_INPUT이다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "check_html",
      arguments: { html: "<p>a</p>", path: "/tmp/whatever.html" },
    });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_INPUT");
  });

  it("TC-TOOL-CHECK-HTML-05: 2,000,000자를 초과하면 E_SIZE다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "check_html",
      arguments: { html: "<p>" + "a".repeat(2_000_001) + "</p>" },
    });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_SIZE");
  });

  it("TC-TOOL-CHECK-HTML-06: 존재하지 않는 파일 경로는 E_NOT_FOUND다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "check_html",
      arguments: { path: "/no/such/file.html" },
    });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_NOT_FOUND");
  });

  it("TC-TOOL-CHECK-HTML-07: 정상 페이지도 항상 33개 검사항목 상태표를 포함한다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "check_html",
      arguments: { html: "<!doctype html><html lang=\"ko\"><head><title>정상 페이지</title></head><body><a href=\"#main\">본문 바로가기</a><main id=\"main\">내용</main></body></html>" },
    });
    const report = res.structuredContent as ReportLike;
    expect(report.checkpoints.length).toBe(33);
  });
});
