// kwcag22-checklist.md(단일 소스, ADR-04) 자체의 내부 정합성을 검증한다.
// assets/kwcag22.json·로더가 아직 없어도(T-04 이전) 항상 실행·통과해야 한다 — 문서 회귀 방지용.
import axeCore from "axe-core";
import { parseChecklistSource, parseGradeSummaryLine, parseRuleCatalog } from "./checklist-source.js";

const rows = parseChecklistSource();

describe("kwcag22-checklist.md 단일 소스 정합성", () => {
  it("TC-KWCAG-SRC-01: 검사항목이 정확히 33건이고 ID 중복이 없다", () => {
    expect(rows.length).toBe(33);
    expect(new Set(rows.map((r) => r.id)).size).toBe(33);
    expect(new Set(rows.map((r) => r.alias)).size).toBe(33);
  });

  it("TC-KWCAG-SRC-02: 모든 행이 요구 문장·자동화 등급을 갖는다", () => {
    for (const row of rows) {
      expect(row.requirement.length).toBeGreaterThan(0);
      expect(["auto", "assist", "manual", "na"]).toContain(row.automation);
    }
  });

  it("TC-KWCAG-SRC-03: 등급별 건수 합계가 문서의 '등급 집계' 요약과 일치한다", () => {
    const tally = { auto: 0, assist: 0, manual: 0, na: 0 };
    for (const row of rows) tally[row.automation] += 1;
    expect(tally).toEqual(parseGradeSummaryLine());
    expect(tally.auto + tally.assist + tally.manual + tally.na).toBe(33);
  });

  it("TC-KWCAG-SRC-04: §4에서 인용한 axe 규칙 ID가 axe-core(설치된 버전)에 실제로 존재한다", () => {
    const knownRuleIds = new Set(axeCore.getRules().map((r) => r.ruleId));
    const cited = new Set(rows.flatMap((r) => r.axeRules));
    const unknown = [...cited].filter((id) => !knownRuleIds.has(id));
    expect(unknown).toEqual([]);
  });

  it("TC-KWCAG-SRC-05: 하나의 axe 규칙은 주(主) 검사항목 1개에만 귀속된다(ADR-06)", () => {
    const owners = new Map<string, string[]>();
    for (const row of rows) {
      for (const ruleId of row.axeRules) {
        owners.set(ruleId, [...(owners.get(ruleId) ?? []), row.id]);
      }
    }
    const multiOwned = [...owners.entries()].filter(([, ids]) => ids.length > 1);
    expect(multiOwned).toEqual([]);
  });

  it("TC-KWCAG-SRC-06: §4에서 참조한 k-/b- 규칙 ID 합집합이 §5 규칙 목록과 정확히 같다", () => {
    const catalog = parseRuleCatalog();
    const declaredIds = new Set([...catalog.t1, ...catalog.t2, ...catalog.b]);
    const citedIds = new Set(
      rows.flatMap((r) => r.ownRules).filter((id) => id.startsWith("k-") || id.startsWith("b-")),
    );
    const citedButNotDeclared = [...citedIds].filter((id) => !declaredIds.has(id));
    // 백로그 규칙(b-widget-keyboard)은 §4에서 아직 인용되지 않을 수 있다 — 선언만 되고 미인용은 허용.
    const declaredButNotCited = [...declaredIds].filter(
      (id) => !citedIds.has(id) && id !== "b-widget-keyboard",
    );
    expect(citedButNotDeclared).toEqual([]);
    expect(declaredButNotCited).toEqual([]);
  });

  it("TC-KWCAG-SRC-07: T1(18)·T2(13)·B(6+백로그1) 개수가 §5 소제목과 일치한다", () => {
    const catalog = parseRuleCatalog();
    expect(catalog.t1.length).toBe(18);
    expect(catalog.t2.length).toBe(13);
    expect(catalog.b.length).toBe(7);
  });

  it("TC-KWCAG-SRC-08: 2.2 신규 9항목이 본문 각주와 정확히 일치한다", () => {
    const expected = ["6.1.4", "6.4.4", "6.5.1", "6.5.2", "6.5.3", "6.5.4", "7.2.2", "7.3.3", "7.3.4"];
    const actual = rows.filter((r) => r.newIn22).map((r) => r.id).sort();
    expect(actual).toEqual([...expected].sort());
  });

  it("TC-KWCAG-SRC-09: 6.4.4(전자출판 고유 항목)는 WCAG 대응이 없고 등급이 N/A다", () => {
    const row = rows.find((r) => r.id === "6.4.4");
    expect(row?.wcag).toEqual([]);
    expect(row?.automation).toBe("na");
  });
});
