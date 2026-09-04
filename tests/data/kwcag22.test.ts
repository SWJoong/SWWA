// 데이터 계약 테스트(ADR-04): assets/kwcag22.json + src/data/kwcag22.ts 로더가 단일 소스
// (kwcag22-checklist.md)와 정확히 일치해야 한다. T-04 전에는 로더가 없어 모듈 로드 자체가
// 실패한다 — 의도된 실패다("실패 상태 커밋" 후 T-04가 초록으로 만든다).
import { loadKwcag22 } from "../../src/data/kwcag22.js";
import { loadWcag22 } from "../../src/data/wcag22.js";
import { loadAxeMap } from "../../src/data/axe-map.js";
import { parseChecklistSource } from "./checklist-source.js";

const sourceRows = parseChecklistSource();
const bundle = loadKwcag22();
const wcag22 = loadWcag22();
const axeMap = loadAxeMap();

describe("assets/kwcag22.json ↔ 단일 소스 데이터 계약 (T-04)", () => {
  it("TC-KWCAG-DATA-01: version·dataVersion·updatedAt·sourceIds가 채워져 있다", () => {
    expect(bundle.version).toBe("2.2");
    expect(bundle.dataVersion.length).toBeGreaterThan(0);
    expect(bundle.updatedAt.length).toBeGreaterThan(0);
    expect(bundle.sourceIds.length).toBeGreaterThan(0);
  });

  it("TC-KWCAG-DATA-02: 검사항목이 33건이며 단일 소스와 같은 순서·ID·별칭이다", () => {
    expect(bundle.checkpoints.length).toBe(33);
    expect(bundle.checkpoints.map((c) => c.id)).toEqual(sourceRows.map((r) => r.id));
    expect(bundle.checkpoints.map((c) => c.alias)).toEqual(sourceRows.map((r) => r.alias));
  });

  it("TC-KWCAG-DATA-03: name_ko·requirement_ko·automation·newIn22가 단일 소스와 일치한다", () => {
    for (const row of sourceRows) {
      const cp = bundle.checkpoints.find((c) => c.id === row.id);
      expect(cp, `${row.id} 항목이 kwcag22.json에 없습니다`).toBeDefined();
      expect(cp?.name_ko).toBe(row.name);
      expect(cp?.requirement_ko).toBe(row.requirement);
      expect(cp?.automation).toBe(row.automation);
      expect(cp?.newIn22).toBe(row.newIn22);
    }
  });

  it("TC-KWCAG-DATA-04: axeRules가 단일 소스 인용 목록과 정확히 같은 집합이다", () => {
    for (const row of sourceRows) {
      const cp = bundle.checkpoints.find((c) => c.id === row.id);
      expect(new Set(cp?.axeRules ?? [])).toEqual(new Set(row.axeRules));
    }
  });

  it("TC-KWCAG-DATA-05: kRules·bRules 합집합이 단일 소스의 k-/b- 규칙 인용과 정확히 같은 집합이다", () => {
    for (const row of sourceRows) {
      const cp = bundle.checkpoints.find((c) => c.id === row.id);
      const combined = new Set([...(cp?.kRules ?? []), ...(cp?.bRules ?? [])]);
      const expected = new Set(
        row.ownRules.filter((id) => id.startsWith("k-") || id.startsWith("b-")),
      );
      expect(combined).toEqual(expected);
    }
  });

  it("TC-KWCAG-DATA-06: WCAG A/AA 각 SC가 최소 하나의 kwcagIds를 갖거나, 매핑이 없다고 명시된 SC만 비어 있다", () => {
    // wcag-mapping.md §1에서 대응 KWCAG가 없다고 명시한 SC 목록(빈 배열이 정상인 경우).
    const noKwcagMapping = new Set([
      "1.2.4", "1.2.5", "1.3.4", "1.3.5", "1.4.4", "1.4.5", "1.4.10", "1.4.12", "1.4.13",
      "2.4.5", "2.4.11", "2.5.7", "3.1.2", "3.2.3", "3.2.4", "3.3.4", "4.1.3",
    ]);
    for (const criterion of wcag22.criteria) {
      expect(Array.isArray(criterion.kwcagIds)).toBe(true);
      if (criterion.level === "AAA") continue;
      if (noKwcagMapping.has(criterion.sc)) continue;
      expect(criterion.kwcagIds.length, `${criterion.sc}(${criterion.level})는 kwcagIds가 비었습니다`).toBeGreaterThan(0);
    }
  });

  it("TC-KWCAG-DATA-07: axeRules는 axe-rule-map.json의 staticDisabled 목록과 모순되지 않는다", () => {
    const staticDisabled = new Set(
      Object.entries(axeMap)
        .filter(([, meta]) => meta.staticDisabled)
        .map(([ruleId]) => ruleId),
    );
    // 정적 비활성 규칙은 02-architecture §3.1의 STATIC_DISABLED_RULES와 이름이 같아야 한다.
    const expected = new Set([
      "color-contrast",
      "color-contrast-enhanced",
      "link-in-text-block",
      "target-size",
      "scrollable-region-focusable",
      "no-autoplay-audio",
      "frame-tested",
      "css-orientation-lock",
    ]);
    expect(staticDisabled).toEqual(expected);
  });
});
