import { rule } from "../../src/rules/k/k-gesture-listener.js";
import { loadFixture, runRule } from "./rule-harness.js";

describe("k-gesture-listener (6.5.1, T2)", () => {
  it("TC-K-GESTURE-LISTENER-01: touchmove 등 제스처 처리를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-gesture-listener", "fail.html"));
    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-GESTURE-LISTENER-02: 일반 click 핸들러는 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-gesture-listener", "pass.html"))).toEqual([]);
  });
});
