import { rule } from "../../src/rules/k/k-down-event-action.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-down-event-action (6.5.2, T2)", () => {
  it("TC-K-DOWN-EVENT-ACTION-01: onmousedown 인라인 핸들러를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-down-event-action", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-down-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-DOWN-EVENT-ACTION-02: onclick은 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-down-event-action", "pass.html"))).toEqual([]);
  });
});
