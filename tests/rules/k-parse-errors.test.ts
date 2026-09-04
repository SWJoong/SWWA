import { rule } from "../../src/rules/k/k-parse-errors.js";
import { loadFixture, runRule } from "./rule-harness.js";

describe("k-parse-errors (8.1.1)", () => {
  it("TC-K-PARSE-ERRORS-01: 중복 속성 등 화이트리스트 오류를 위치와 함께 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-parse-errors", "fail.html"));
    expect(findings.length).toBe(1);
    expect(findings[0]?.selector).toBe("L4:C17");
  });

  it("TC-K-PARSE-ERRORS-02: 정상 마크업은 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-parse-errors", "pass.html"));
    expect(findings).toEqual([]);
  });
});
