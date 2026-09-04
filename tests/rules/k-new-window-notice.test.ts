import { rule } from "../../src/rules/k/k-new-window-notice.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-new-window-notice (7.2.1)", () => {
  it("TC-K-NEW-WINDOW-NOTICE-01: 새 창 안내 없는 target=_blank를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-new-window-notice", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-newwin-1"]);
  });

  it("TC-K-NEW-WINDOW-NOTICE-02: '새 창' 안내가 있으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-new-window-notice", "pass.html"));
    expect(findings).toEqual([]);
  });
});
