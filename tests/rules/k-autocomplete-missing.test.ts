import { rule } from "../../src/rules/k/k-autocomplete-missing.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-autocomplete-missing (7.3.4, T2)", () => {
  it("TC-K-AUTOCOMPLETE-MISSING-01: 개인정보 필드에 autocomplete가 없으면 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-autocomplete-missing", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-ac-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-AUTOCOMPLETE-MISSING-02: autocomplete가 있으면 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-autocomplete-missing", "pass.html"))).toEqual([]);
  });
});
