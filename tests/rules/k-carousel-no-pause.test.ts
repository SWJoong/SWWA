import { rule } from "../../src/rules/k/k-carousel-no-pause.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-carousel-no-pause (6.2.2, T2)", () => {
  it("TC-K-CAROUSEL-NO-PAUSE-01: 정지 컨트롤 없는 캐러셀을 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-carousel-no-pause", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-carousel-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-CAROUSEL-NO-PAUSE-02: 일시정지 컨트롤이 있으면 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-carousel-no-pause", "pass.html"))).toEqual([]);
  });
});
