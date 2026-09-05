import { rule } from "../../src/rules/k/k-error-association.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-error-association (7.3.1, T2)", () => {
  it("TC-K-ERROR-ASSOCIATION-01: aria-invalid인데 오류 메시지 연결이 없으면 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-error-association", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-err-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-ERROR-ASSOCIATION-02: aria-describedby로 연결되면 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-error-association", "pass.html"))).toEqual([]);
  });
});
