import { rule } from "../../src/rules/k/k-placeholder-only-label.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-placeholder-only-label (7.3.2)", () => {
  it("TC-K-PLACEHOLDER-ONLY-LABEL-01: placeholder만 있는 입력 필드를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-placeholder-only-label", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-input-1"]);
  });

  it("TC-K-PLACEHOLDER-ONLY-LABEL-02: label이 연결되어 있으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-placeholder-only-label", "pass.html"));
    expect(findings).toEqual([]);
  });
});
