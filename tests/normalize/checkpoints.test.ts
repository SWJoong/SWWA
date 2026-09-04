import { computeCheckpoints } from "../../src/normalize/checkpoints.js";
import { loadDataBundle } from "../../src/data/loader.js";
import type { Finding } from "../../src/report/types.js";

const data = loadDataBundle();

function finding(overrides: Partial<Finding>): Finding {
  return {
    ruleId: "k-test",
    engine: "k-rule",
    kwcag: "6.4.1",
    wcag: ["2.4.1"],
    impact: "serious",
    outcome: "fail",
    confidence: "high",
    selector: "#x",
    html: "<a></a>",
    message: "m",
    fix: "f",
    ...overrides,
  };
}

describe("normalize/checkpoints.ts (33항목 status 규칙, 02 §4)", () => {
  it("TC-NORM-CHECKPOINTS-01: 항상 33개를 단일 소스 순서로 반환한다", () => {
    const result = computeCheckpoints([], "static", data);
    expect(result.length).toBe(33);
    expect(result.map((c) => c.id)).toEqual(data.kwcag22.checkpoints.map((c) => c.id));
  });

  it("TC-NORM-CHECKPOINTS-02: fail Finding이 있으면 해당 검사항목이 fail이다", () => {
    const result = computeCheckpoints([finding({ kwcag: "6.4.1", outcome: "fail" })], "static", data);
    const cp = result.find((c) => c.id === "6.4.1");
    expect(cp?.status).toBe("fail");
    expect(cp?.findings).toBe(1);
  });

  it("TC-NORM-CHECKPOINTS-03: incomplete만 있으면 incomplete다", () => {
    const result = computeCheckpoints([finding({ kwcag: "6.4.1", outcome: "incomplete" })], "static", data);
    expect(result.find((c) => c.id === "6.4.1")?.status).toBe("incomplete");
  });

  it("TC-NORM-CHECKPOINTS-04: 등급이 manual인 항목은 Finding이 없으면 manual이다", () => {
    // 5.4.4(콘텐츠 간의 구분)는 자체 규칙이 없는 수동 등급 항목이다.
    const result = computeCheckpoints([], "static", data);
    expect(result.find((c) => c.id === "5.4.4")?.status).toBe("manual");
  });

  it("TC-NORM-CHECKPOINTS-05: 6.4.4(N/A 등급)는 조건부라 근거가 없으면 na다", () => {
    const result = computeCheckpoints([], "static", data);
    expect(result.find((c) => c.id === "6.4.4")?.status).toBe("na");
  });

  it("TC-NORM-CHECKPOINTS-06: 정적 모드에서 귀속 규칙이 전부 비활성이면 manual이다(5.4.3 명도 대비)", () => {
    // 5.4.3은 axe color-contrast(정적 비활성)만 귀속되어 있어 static 모드에서는 Finding이 없다.
    const result = computeCheckpoints([], "static", data);
    expect(result.find((c) => c.id === "5.4.3")?.status).toBe("manual");
  });

  it("TC-NORM-CHECKPOINTS-07: 정적 모드에서도 실행 가능한 규칙(6.4.1)에 fail이 없으면 pass다", () => {
    const result = computeCheckpoints([finding({ kwcag: "6.4.2", outcome: "fail" })], "static", data);
    expect(result.find((c) => c.id === "6.4.1")?.status).toBe("pass");
  });
});
