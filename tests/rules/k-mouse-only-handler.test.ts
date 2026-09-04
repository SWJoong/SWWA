import { rule } from "../../src/rules/k/k-mouse-only-handler.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-mouse-only-handler (6.1.1)", () => {
  it("TC-K-MOUSE-ONLY-HANDLER-01: 키보드 접근 불가한 클릭 핸들러를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-mouse-only-handler", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-click-1"]);
  });

  it("TC-K-MOUSE-ONLY-HANDLER-02: button·tabindex+role이 있으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-mouse-only-handler", "pass.html"));
    expect(findings).toEqual([]);
  });
});
