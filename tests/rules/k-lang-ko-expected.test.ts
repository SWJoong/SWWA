import { rule } from "../../src/rules/k/k-lang-ko-expected.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-lang-ko-expected (7.1.1)", () => {
  it("TC-K-LANG-KO-EXPECTED-01: 한글 비율이 높은데 lang이 ko가 아니면 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-lang-ko-expected", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["html"]);
  });

  it("TC-K-LANG-KO-EXPECTED-02: lang=ko면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-lang-ko-expected", "pass.html"));
    expect(findings).toEqual([]);
  });
});
