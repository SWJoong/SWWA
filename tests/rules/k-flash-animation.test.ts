import { rule } from "../../src/rules/k/k-flash-animation.js";
import { loadFixture, runRule } from "./rule-harness.js";

describe("k-flash-animation (6.3.1, T2)", () => {
  it("TC-K-FLASH-ANIMATION-01: 짧은 주기 무한 반복 애니메이션을 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-flash-animation", "fail.html"));
    expect(findings.length).toBe(1);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-FLASH-ANIMATION-02: 긴 주기(2s) 애니메이션은 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-flash-animation", "pass.html"))).toEqual([]);
  });
});
