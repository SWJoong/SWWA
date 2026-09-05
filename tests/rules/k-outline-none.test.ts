import { rule } from "../../src/rules/k/k-outline-none.js";
import { loadFixture, runRule } from "./rule-harness.js";

describe("k-outline-none (6.1.2, T2)", () => {
  it("TC-K-OUTLINE-NONE-01: :focus outline 제거+대안 없음을 incomplete로 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-outline-none", "fail.html"));
    expect(findings.length).toBe(1);
    expect(findings[0]?.outcome).toBe("incomplete");
    expect(findings[0]?.selector).toContain(":focus");
  });

  it("TC-K-OUTLINE-NONE-02: box-shadow 대안이 있으면 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-outline-none", "pass.html"))).toEqual([]);
  });
});
