import { rule } from "../../src/rules/k/k-table-caption.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-table-caption (5.3.1)", () => {
  it("TC-K-TABLE-CAPTION-01: caption 없는 데이터 표를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-table-caption", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-table-1"]);
  });

  it("TC-K-TABLE-CAPTION-02: caption이 있으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-table-caption", "pass.html"));
    expect(findings).toEqual([]);
  });
});
