import { rule } from "../../src/rules/k/k-table-th-missing.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-table-th-missing (5.3.1)", () => {
  it("TC-K-TABLE-TH-MISSING-01: th 없는 데이터 표를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-table-th-missing", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-table-2"]);
  });

  it("TC-K-TABLE-TH-MISSING-02: th가 있으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-table-th-missing", "pass.html"));
    expect(findings).toEqual([]);
  });
});
