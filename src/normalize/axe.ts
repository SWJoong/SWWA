import type { AxeRuleMap } from "../data/axe-map.js";
import type { Wcag22Bundle } from "../data/wcag22.js";
import type { Finding } from "../report/types.js";
import { localizeAxeMessage } from "./locale.js";

const HTML_SNIPPET_MAX = 300;

/** "1.4.11" → "wcag1411"(axe 태그 관례). 실제 SC 목록에서만 역산하므로 자리수 모호성이 없다. */
function tagForSc(sc: string): string {
  return `wcag${sc.replace(/\./g, "")}`;
}

/**
 * axe 규칙의 KWCAG 귀속을 정한다(ADR-06). axe-rule-map.json에 오버라이드가 있으면 그것을
 * 그대로 쓰고(명시적 null 포함 — "매핑 없음"으로 확정된 경우), 없으면 규칙의 wcag 태그로
 * kwcagIds를 역추적한다. 그래도 없으면 null("기타(WCAG)" 그룹).
 */
export function resolveKwcag(
  ruleId: string,
  tags: string[],
  axeRuleMap: AxeRuleMap,
  wcag22: Wcag22Bundle,
): string | null {
  const override = axeRuleMap[ruleId];
  if (override && override.kwcag !== undefined) return override.kwcag;
  const tagSet = new Set(tags);
  for (const criterion of wcag22.criteria) {
    if (criterion.kwcagIds.length === 0) continue;
    if (tagSet.has(tagForSc(criterion.sc))) return criterion.kwcagIds[0] ?? null;
  }
  return null;
}

interface AxeNode {
  target: string[];
  html: string;
}

interface AxeRuleResult {
  id: string;
  impact?: string | null;
  help: string;
  description: string;
  helpUrl?: string;
  tags: string[];
  nodes: AxeNode[];
}

export interface AxeRunResults {
  violations: AxeRuleResult[];
  incomplete: AxeRuleResult[];
}

const IMPACT_FALLBACK = "moderate" as const;
const VALID_IMPACTS = new Set(["critical", "serious", "moderate", "minor"]);

function normalizeImpact(impact: string | null | undefined): Finding["impact"] {
  return impact && VALID_IMPACTS.has(impact) ? (impact as Finding["impact"]) : IMPACT_FALLBACK;
}

/** wcag 태그("wcag111" 등)를 실제 SC 목록에 대조해 "1.1.1" 형태로 되돌린다(자리수 모호성 회피). */
function tagsToScList(tags: string[], wcag22: Wcag22Bundle): string[] {
  const tagSet = new Set(tags);
  const scs: string[] = [];
  for (const criterion of wcag22.criteria) {
    if (tagSet.has(tagForSc(criterion.sc))) scs.push(criterion.sc);
  }
  return scs;
}

function toFindings(
  results: AxeRuleResult[],
  outcome: Finding["outcome"],
  confidence: Finding["confidence"],
  axeRuleMap: AxeRuleMap,
  wcag22: Wcag22Bundle,
): Finding[] {
  const findings: Finding[] = [];
  for (const result of results) {
    const kwcag = resolveKwcag(result.id, result.tags, axeRuleMap, wcag22);
    const wcag = tagsToScList(result.tags, wcag22);
    const { help, description } = localizeAxeMessage(result.id, result.help, result.description);
    for (const node of result.nodes) {
      findings.push({
        ruleId: result.id,
        engine: "axe",
        kwcag,
        wcag,
        impact: normalizeImpact(result.impact),
        outcome,
        confidence,
        selector: node.target.join(" "),
        html: node.html.slice(0, HTML_SNIPPET_MAX),
        message: help,
        fix: description,
        helpUrl: result.helpUrl,
      });
    }
  }
  return findings;
}

/** axe.run() 결과(violations/incomplete)를 Finding[]으로 정규화한다. passes는 집계에만 쓰인다. */
export function normalizeAxeResults(
  axeResults: AxeRunResults,
  axeRuleMap: AxeRuleMap,
  wcag22: Wcag22Bundle,
): Finding[] {
  return [
    ...toFindings(axeResults.violations, "fail", "high", axeRuleMap, wcag22),
    ...toFindings(axeResults.incomplete, "incomplete", "medium", axeRuleMap, wcag22),
  ];
}
