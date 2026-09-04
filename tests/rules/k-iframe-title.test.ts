import { rule } from "../../src/rules/k/k-iframe-title.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-iframe-title (6.4.2)", () => {
  it("TC-K-IFRAME-TITLE-01: title 없는 iframe을 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-iframe-title", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-iframe-1"]);
  });

  it("TC-K-IFRAME-TITLE-02: 의미 있는 title이 있으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-iframe-title", "pass.html"));
    expect(findings).toEqual([]);
  });
});
