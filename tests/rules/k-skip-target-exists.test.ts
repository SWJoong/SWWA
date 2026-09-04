import { rule } from "../../src/rules/k/k-skip-target-exists.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-skip-target-exists (6.4.1)", () => {
  it("TC-K-SKIP-TARGET-EXISTS-01: 바로가기 링크의 대상이 없으면 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-skip-target-exists", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-target-1"]);
  });

  it("TC-K-SKIP-TARGET-EXISTS-02: 대상이 존재하면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-skip-target-exists", "pass.html"));
    expect(findings).toEqual([]);
  });
});
