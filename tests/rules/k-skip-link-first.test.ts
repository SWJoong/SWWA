import { rule } from "../../src/rules/k/k-skip-link-first.js";
import { loadFixture, runRule } from "./rule-harness.js";

describe("k-skip-link-first (6.4.1)", () => {
  it("TC-K-SKIP-LINK-FIRST-01: 첫 초점 요소가 문서 내 앵커가 아니면 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-skip-link-first", "fail.html"));
    expect(findings.length).toBe(1);
  });

  it("TC-K-SKIP-LINK-FIRST-02: 첫 초점이 본문 바로가기 링크면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-skip-link-first", "pass.html"));
    expect(findings).toEqual([]);
  });
});
