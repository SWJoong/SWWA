import { rule } from "../../src/rules/k/k-media-track.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-media-track (5.2.1)", () => {
  it("TC-K-MEDIA-TRACK-01: 자막 트랙 없는 video를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-media-track", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-video-1"]);
    expect(findings[0]?.kwcag).toBe("5.2.1");
  });

  it("TC-K-MEDIA-TRACK-02: captions 트랙이 있으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-media-track", "pass.html"));
    expect(findings).toEqual([]);
  });
});
