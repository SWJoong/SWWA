import { JSDOM } from "jsdom";
import { createFinding } from "../../src/normalize/finding.js";
import type { RuleMeta } from "../../src/rules/types.js";

describe("createFinding (normalize/finding.ts)", () => {
  const rule: RuleMeta = {
    id: "k-test",
    kwcag: "6.4.1",
    wcag: ["2.4.1"],
    engine: "k",
    impact: "serious",
    confidence: "high",
    tier: "T1",
  };

  it("TC-NORM-FINDING-01: k 규칙 메타를 engine='k-rule' Finding으로 변환한다", () => {
    const dom = new JSDOM('<div id="x">hi</div>');
    const el = dom.window.document.getElementById("x");
    const finding = createFinding(rule, el, { message: "메시지", fix: "수정안", outcome: "fail" });
    expect(finding).toMatchObject({
      ruleId: "k-test",
      engine: "k-rule",
      kwcag: "6.4.1",
      wcag: ["2.4.1"],
      impact: "serious",
      outcome: "fail",
      confidence: "high",
      selector: "#x",
      message: "메시지",
      fix: "수정안",
    });
    expect(finding.html).toContain("hi");
  });

  it("TC-NORM-FINDING-02: confidence를 개별 호출에서 재정의할 수 있다", () => {
    const dom = new JSDOM('<div id="y"></div>');
    const el = dom.window.document.getElementById("y");
    const finding = createFinding(rule, el, {
      message: "m",
      fix: "f",
      outcome: "incomplete",
      confidence: "low",
    });
    expect(finding.confidence).toBe("low");
    expect(finding.outcome).toBe("incomplete");
  });

  it("TC-NORM-FINDING-03: b 규칙은 engine='b-rule'로 변환한다", () => {
    const bRule: RuleMeta = { ...rule, id: "b-test", engine: "b", tier: "B" };
    const dom = new JSDOM('<div id="z"></div>');
    const finding = createFinding(bRule, dom.window.document.getElementById("z"), {
      message: "m",
      fix: "f",
      outcome: "fail",
    });
    expect(finding.engine).toBe("b-rule");
  });

  it("TC-NORM-FINDING-04: 요소가 없으면(document-level) selector·html이 빈 문자열이다", () => {
    const finding = createFinding(rule, null, { message: "m", fix: "f", outcome: "fail" });
    expect(finding.selector).toBe("");
    expect(finding.html).toBe("");
  });
});
