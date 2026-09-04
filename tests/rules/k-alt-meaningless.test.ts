import { rule } from "../../src/rules/k/k-alt-meaningless.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-alt-meaningless (5.1.1)", () => {
  it("TC-K-ALT-MEANINGLESS-01: 무의미한 alt(사전 일치·파일명)를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-alt-meaningless", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-alt-1", "#bad-alt-2"]);
    expect(findings.every((f) => f.ruleId === "k-alt-meaningless" && f.kwcag === "5.1.1")).toBe(true);
  });

  it("TC-K-ALT-MEANINGLESS-02: 의미 있는 alt·빈 alt(장식용)는 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-alt-meaningless", "pass.html"));
    expect(findings).toEqual([]);
  });
});
