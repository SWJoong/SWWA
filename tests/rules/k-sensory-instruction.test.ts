import { rule } from "../../src/rules/k/k-sensory-instruction.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-sensory-instruction (5.3.3, T2)", () => {
  it("TC-K-SENSORY-INSTRUCTION-01: 감각 지시어+지시 맥락을 incomplete로 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-sensory-instruction", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-sensory-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-SENSORY-INSTRUCTION-02: 감각어 없는 지시는 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-sensory-instruction", "pass.html"))).toEqual([]);
  });
});
