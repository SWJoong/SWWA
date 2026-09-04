import { rule } from "../../src/rules/k/k-autoplay-media.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-autoplay-media (5.4.2)", () => {
  it("TC-K-AUTOPLAY-MEDIA-01: muted 없는 autoplay video를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-autoplay-media", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-autoplay-1"]);
  });

  it("TC-K-AUTOPLAY-MEDIA-02: muted가 있으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-autoplay-media", "pass.html"));
    expect(findings).toEqual([]);
  });
});
