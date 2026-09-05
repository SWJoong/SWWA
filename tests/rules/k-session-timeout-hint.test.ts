import { rule } from "../../src/rules/k/k-session-timeout-hint.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-session-timeout-hint (6.2.1, T2)", () => {
  it("TC-K-SESSION-TIMEOUT-HINT-01: 자동 로그아웃 문구를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-session-timeout-hint", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-timeout-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-SESSION-TIMEOUT-HINT-02: 관련 문구가 없으면 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-session-timeout-hint", "pass.html"))).toEqual([]);
  });
});
