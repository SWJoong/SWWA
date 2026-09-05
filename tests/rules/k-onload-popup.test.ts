import { rule } from "../../src/rules/k/k-onload-popup.js";
import { loadFixture, runRule } from "./rule-harness.js";

describe("k-onload-popup (7.2.1, T2)", () => {
  it("TC-K-ONLOAD-POPUP-01: body onload의 window.open을 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-onload-popup", "fail.html"));
    expect(findings.length).toBe(1);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-ONLOAD-POPUP-02: 자동 팝업이 없으면 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-onload-popup", "pass.html"))).toEqual([]);
  });
});
