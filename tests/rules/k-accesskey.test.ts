import { rule } from "../../src/rules/k/k-accesskey.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-accesskey (6.1.4, T2)", () => {
  it("TC-K-ACCESSKEY-01: accesskey 사용을 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-accesskey", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-accesskey-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-ACCESSKEY-02: accesskey가 없으면 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-accesskey", "pass.html"))).toEqual([]);
  });
});
