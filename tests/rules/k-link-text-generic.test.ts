import { rule } from "../../src/rules/k/k-link-text-generic.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-link-text-generic (6.4.3)", () => {
  it("TC-K-LINK-TEXT-GENERIC-01: '더보기' 같은 일반 링크 텍스트를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-link-text-generic", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-link-1"]);
  });

  it("TC-K-LINK-TEXT-GENERIC-02: 목적이 담긴 텍스트나 aria-label 보완은 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-link-text-generic", "pass.html"));
    expect(findings).toEqual([]);
  });
});
