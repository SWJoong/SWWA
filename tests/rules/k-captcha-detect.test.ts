import { rule } from "../../src/rules/k/k-captcha-detect.js";
import { loadFixture, runRule, selectorsOf } from "./rule-harness.js";

describe("k-captcha-detect (7.3.3)", () => {
  it("TC-K-CAPTCHA-DETECT-01: 캡차 키워드를 검출한다(대안 인증 수동 확인 필요)", () => {
    const findings = runRule(rule, loadFixture("k-captcha-detect", "fail.html"));
    expect(selectorsOf(findings)).toEqual(["#bad-captcha-1"]);
    expect(findings[0]?.outcome).toBe("incomplete");
  });

  it("TC-K-CAPTCHA-DETECT-02: 캡차가 없으면 오탐 0건이다", () => {
    const findings = runRule(rule, loadFixture("k-captcha-detect", "pass.html"));
    expect(findings).toEqual([]);
  });
});
