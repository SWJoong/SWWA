import { connectClient } from "./tool-harness.js";
import { loadDataBundle } from "../../src/data/loader.js";
import type { CheckpointStatus } from "../../src/report/types.js";

const data = loadDataBundle();

function makeReport(overrides: Record<string, CheckpointStatus> = {}): { checkpoints: { id: string; status: CheckpointStatus }[] } {
  return {
    checkpoints: data.kwcag22.checkpoints.map((cp) => ({
      id: cp.id,
      status: overrides[cp.id] ?? (cp.automation === "manual" ? "manual" : cp.automation === "na" ? "na" : "pass"),
    })),
  };
}

describe("estimate_cert_readiness 도구 (InMemory 계약)", () => {
  it("TC-TOOL-CERT-01: tools/list에 노출된다", async () => {
    const client = await connectClient();
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "estimate_cert_readiness")).toBeDefined();
  });

  it("TC-TOOL-CERT-02: reports 배열을 집계해 33개 검사항목·overall을 반환한다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "estimate_cert_readiness",
      arguments: { reports: [makeReport({ "6.4.1": "fail" }), makeReport()] },
    });
    const out = res.structuredContent as {
      checkpoints: unknown[];
      overall: { pagesAudited: number };
      gaps: { id: string }[];
    };
    expect(out.checkpoints.length).toBe(33);
    expect(out.overall.pagesAudited).toBe(2);
    expect(out.gaps.some((g) => g.id === "6.4.1")).toBe(true);
  });

  it("TC-TOOL-CERT-03: reports와 reportPaths를 둘 다 안 주면 E_INPUT이다", async () => {
    const client = await connectClient();
    const res = await client.callTool({ name: "estimate_cert_readiness", arguments: {} });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_INPUT");
  });

  it("TC-TOOL-CERT-04: 둘 다 주면 E_INPUT이다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "estimate_cert_readiness",
      arguments: { reports: [makeReport()], reportPaths: ["/tmp/x.json"] },
    });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_INPUT");
  });

  it("TC-TOOL-CERT-05: 형식이 잘못된 Report는 E_INPUT이다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "estimate_cert_readiness",
      arguments: { reports: [{ notCheckpoints: true }] },
    });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_INPUT");
  });

  it("TC-TOOL-CERT-06: 존재하지 않는 reportPaths는 E_NOT_FOUND이다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "estimate_cert_readiness",
      arguments: { reportPaths: ["/no/such/report.json"] },
    });
    expect(res.isError).toBe(true);
    expect((res.structuredContent as { code: string }).code).toBe("E_NOT_FOUND");
  });
});
