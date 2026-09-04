import { rule } from "../../src/rules/k/k-title-generic.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-title-generic (6.4.2)", () => {
  it("TC-K-TITLE-GENERIC-01: '제목 없음' 같은 무의미한 title을 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-title-generic", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["html > head > title"]);
  });

  it("TC-K-TITLE-GENERIC-02: 목적을 담은 title은 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-title-generic", "pass.html"));
    expect(findings).toEqual([]);
  });
});
