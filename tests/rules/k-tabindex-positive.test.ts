import { rule } from "../../src/rules/k/k-tabindex-positive.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-tabindex-positive (5.3.2)", () => {
  it("TC-K-TABINDEX-POSITIVE-01: tabindex 양수값을 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-tabindex-positive", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-tabindex-1"]);
  });

  it("TC-K-TABINDEX-POSITIVE-02: tabindex=0은 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-tabindex-positive", "pass.html"));
    expect(findings).toEqual([]);
  });
});
