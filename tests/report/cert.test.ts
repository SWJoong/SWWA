import { estimateCertReadiness, type CertInputReport } from "../../src/report/cert.js";
import { loadDataBundle } from "../../src/data/loader.js";
import type { CheckpointStatus } from "../../src/report/types.js";

const data = loadDataBundle();

/** 33개 검사항목을 기본 status로 채운 뒤 overrides만 바꾼 Report를 만든다. */
function makeReport(overrides: Record<string, CheckpointStatus> = {}, base: CheckpointStatus = "pass"): CertInputReport {
  return {
    checkpoints: data.kwcag22.checkpoints.map((cp) => ({
      id: cp.id,
      status: overrides[cp.id] ?? (cp.automation === "manual" ? "manual" : cp.automation === "na" ? "na" : base),
    })),
  };
}

describe("estimate_cert_readiness 집계 (cert.ts)", () => {
  it("TC-CERT-01: 항상 33개 검사항목을 반환하고 pagesAudited가 report 수와 일치한다", () => {
    const r = estimateCertReadiness([makeReport(), makeReport()], undefined, data);
    expect(r.checkpoints.length).toBe(33);
    expect(r.overall.pagesAudited).toBe(2);
  });

  it("TC-CERT-02: pageCount를 지정하면 그 값을 pagesAudited로 쓴다", () => {
    const r = estimateCertReadiness([makeReport()], 10, data);
    expect(r.overall.pagesAudited).toBe(10);
  });

  it("TC-CERT-03: autoCheckedCoverage는 자동+보조 등급 비율(24/33≈0.73)이다", () => {
    const r = estimateCertReadiness([makeReport()], undefined, data);
    expect(r.overall.autoCheckedCoverage).toBe(0.73);
  });

  it("TC-CERT-04: 특정 검사항목이 일부 페이지에서 fail이면 complianceRate·failingPages가 반영된다", () => {
    const reports = [makeReport({ "6.4.1": "fail" }), makeReport({ "6.4.1": "fail" }), makeReport(), makeReport(), makeReport()];
    const r = estimateCertReadiness(reports, undefined, data);
    const cp = r.checkpoints.find((c) => c.id === "6.4.1");
    expect(cp?.failingPages).toBe(2);
    expect(cp?.pages).toBe(5);
    expect(cp?.complianceRate).toBe(0.6);
    expect(cp?.status).toBe("fail");
  });

  it("TC-CERT-05: 준수율이 기준(95%) 미만인 자동/보조 항목이 gaps에 우선순위와 함께 담긴다", () => {
    const reports = [makeReport({ "6.4.1": "fail", "7.3.2": "fail" }), makeReport({ "6.4.1": "fail" })];
    const r = estimateCertReadiness(reports, undefined, data);
    const ids = r.gaps.map((g) => g.id);
    expect(ids).toContain("6.4.1");
    expect(ids).toContain("7.3.2");
    // 실패 페이지가 더 많은 6.4.1이 우선순위 1
    expect(r.gaps[0]?.id).toBe("6.4.1");
    expect(r.gaps[0]?.priority).toBe(1);
    expect(r.gaps[0]?.reason).toContain("준수율");
  });

  it("TC-CERT-06: 수동 등급 항목은 manualRemaining에 담긴다", () => {
    const r = estimateCertReadiness([makeReport()], undefined, data);
    const ids = r.manualRemaining.map((m) => m.id);
    expect(ids).toContain("5.4.4"); // 콘텐츠 간의 구분(수동)
    expect(ids).not.toContain("6.4.1"); // 자동 등급은 manualRemaining에 없음
  });

  it("TC-CERT-07: notices에 기준 재확인 고지와 추정치·면책 고지가 포함된다", () => {
    const r = estimateCertReadiness([makeReport()], undefined, data);
    const joined = r.notices.join("\n");
    expect(joined).toContain("재확인");
    expect(joined).toContain("추정치");
    expect(joined).toContain("판단할 수 없습니다");
  });

  it("TC-CERT-08: 전부 통과면 gaps가 비고 estimatedExpertRate가 1이다", () => {
    const r = estimateCertReadiness([makeReport(), makeReport()], undefined, data);
    expect(r.gaps).toEqual([]);
    expect(r.overall.estimatedExpertRate).toBe(1);
  });
});
