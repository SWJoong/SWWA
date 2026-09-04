#!/usr/bin/env node
// 번들 데이터 자산(assets/*.json)을 zod 로더로 검증하는 CI·릴리스 게이트.
// 런타임과 동일한 로더(dist/data/*)를 재사용한다 — 스키마 정의를 한 곳(src/data)에만 둔다.
// 사용 전 `npm run build` 필요(dist 산출물 로드). 실패 시 비정상 종료(exit 1)로 파이프라인 차단.
import { loadDataBundle } from "../dist/data/loader.js";
import axeCore from "axe-core";

try {
  const bundle = loadDataBundle();
  const { kwcag22, wcag22, axeRuleMap } = bundle;

  // (a) 33건·ID 중복 없음은 parseKwcag22 자체가 강제한다(기동 중단으로 이미 보장).

  // (b) 모든 A/AA WCAG SC가 kwcagIds 필드를 갖는다(값이 비어 있는 건 허용, 필드 부재는 불가).
  const missingField = wcag22.criteria.filter(
    (c) => c.level !== "AAA" && !Array.isArray(c.kwcagIds),
  );
  if (missingField.length > 0) {
    throw new Error(`kwcagIds 필드가 없는 A/AA SC: ${missingField.map((c) => c.sc).join(", ")}`);
  }

  // (c) axeRules가 실제 axe.getRules()에 존재한다.
  const knownAxeRuleIds = new Set(axeCore.getRules().map((r) => r.ruleId));
  const unknownAxeRules = new Set();
  for (const cp of kwcag22.checkpoints) {
    for (const ruleId of cp.axeRules) {
      if (!knownAxeRuleIds.has(ruleId)) unknownAxeRules.add(ruleId);
    }
  }
  for (const ruleId of Object.keys(axeRuleMap)) {
    if (!knownAxeRuleIds.has(ruleId)) unknownAxeRules.add(ruleId);
  }
  if (unknownAxeRules.size > 0) {
    throw new Error(`axe-core에 없는 규칙 ID: ${[...unknownAxeRules].join(", ")}`);
  }

  console.error(
    `[validate-assets] OK — 검사항목 ${kwcag22.checkpoints.length}건 · WCAG 기준 ${wcag22.criteria.length}건 · axe 매핑 ${Object.keys(axeRuleMap).length}건`,
  );
} catch (err) {
  console.error(`[validate-assets] 실패: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
