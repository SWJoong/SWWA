import { rule } from "../../src/rules/k/k-select-onchange.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-select-onchange (7.2.1)", () => {
  it("TC-K-SELECT-ONCHANGE-01: onchange로 이동·제출하는 select를 검출한다(수동 확인 필요)", () => {
    const findings = runRule(rule, loadFixture("k-select-onchange", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-select-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-SELECT-ONCHANGE-02: onchange가 없으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-select-onchange", "pass.html"));
    expect(findings).toEqual([]);
  });
});
