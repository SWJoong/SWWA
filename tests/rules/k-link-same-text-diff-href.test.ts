import { rule } from "../../src/rules/k/k-link-same-text-diff-href.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-link-same-text-diff-href (6.4.3, T2)", () => {
  it("TC-K-LINK-SAME-TEXT-DIFF-HREF-01: 같은 텍스트·다른 href를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-link-same-text-diff-href", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-samelink-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-LINK-SAME-TEXT-DIFF-HREF-02: 텍스트가 구별되면 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-link-same-text-diff-href", "pass.html"))).toEqual([]);
  });
});
