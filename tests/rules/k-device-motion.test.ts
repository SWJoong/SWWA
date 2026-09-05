import { rule } from "../../src/rules/k/k-device-motion.js";
import { loadFixture, runRule } from "./rule-harness.js";

describe("k-device-motion (6.5.4, T2)", () => {
  it("TC-K-DEVICE-MOTION-01: devicemotion 리스너를 검출한다", () => {
    const findings = runRule(rule, loadFixture("k-device-motion", "fail.html"));
    expect(findings.length).toBe(1);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-DEVICE-MOTION-02: 관련 코드가 없으면 오탐 0건이다", () => {
    expect(runRule(rule, loadFixture("k-device-motion", "pass.html"))).toEqual([]);
  });
});
