import { normalizeAxeResults, resolveKwcag } from "../../src/normalize/axe.js";
import { loadDataBundle } from "../../src/data/loader.js";

const data = loadDataBundle();

/** 실제 axe.run() 결과의 최소 형태를 흉내 낸 픽스처(violations/incomplete/passes). */
const axeResultFixture = {
  violations: [
    {
      id: "image-alt",
      impact: "critical",
      help: "Images must have alternate text",
      description: "Ensures <img> elements have alternate text",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.13/image-alt",
      tags: ["wcag2a", "wcag111"],
      nodes: [{ target: [".logo"], html: '<img class="logo">' }],
    },
  ],
  incomplete: [
    {
      id: "color-contrast",
      impact: "serious",
      help: "Elements must meet minimum color contrast ratio thresholds",
      description: "Ensures the contrast between foreground and background colors",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.13/color-contrast",
      tags: ["wcag2aa", "wcag143"],
      nodes: [{ target: ["p.notice"], html: "<p class=\"notice\">안내</p>" }],
    },
  ],
  passes: [],
};

describe("normalize/axe.ts", () => {
  it("TC-NORM-AXE-01: 오버라이드가 있는 규칙은 axe-rule-map.json의 kwcag를 우선한다", () => {
    // heading-order는 best-practice라 wcag 태그가 없고 axe-rule-map.json이 5.3.2로 오버라이드한다.
    expect(resolveKwcag("heading-order", ["best-practice"], data.axeRuleMap, data.wcag22)).toBe("5.3.2");
  });

  it("TC-NORM-AXE-02: 오버라이드가 없으면 wcag 태그로 kwcagIds를 역추적한다", () => {
    expect(resolveKwcag("image-alt", ["wcag2a", "wcag111"], data.axeRuleMap, data.wcag22)).toBe("5.1.1");
  });

  it("TC-NORM-AXE-03: 매핑이 전혀 없으면 null이다(기타 WCAG 그룹)", () => {
    expect(resolveKwcag("unknown-rule", ["best-practice"], data.axeRuleMap, data.wcag22)).toBeNull();
  });

  it("TC-NORM-AXE-04: violations는 outcome=fail·confidence=high로 변환된다", () => {
    const findings = normalizeAxeResults(axeResultFixture, data.axeRuleMap, data.wcag22);
    const violation = findings.find((f) => f.ruleId === "image-alt");
    expect(violation).toMatchObject({
      engine: "axe",
      kwcag: "5.1.1",
      impact: "critical",
      outcome: "fail",
      confidence: "high",
      selector: ".logo",
    });
    expect(violation?.html).toContain("logo");
  });

  it("TC-NORM-AXE-05: incomplete는 outcome=incomplete·confidence=medium으로 변환된다", () => {
    const findings = normalizeAxeResults(axeResultFixture, data.axeRuleMap, data.wcag22);
    const incomplete = findings.find((f) => f.ruleId === "color-contrast");
    expect(incomplete).toMatchObject({ engine: "axe", outcome: "incomplete", confidence: "medium" });
  });

  it("TC-NORM-AXE-06: passes는 Finding으로 변환하지 않는다(집계에서만 사용)", () => {
    const findings = normalizeAxeResults(axeResultFixture, data.axeRuleMap, data.wcag22);
    expect(findings.length).toBe(2);
  });
});
