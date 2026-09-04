import * as k from "./k/index.js";
import type { StaticRule } from "./types.js";
import type { DataBundle } from "../data/loader.js";

/** T1 18개 정적 규칙 전체 목록(단일 소스 §5와 대조된다, ADR-04). */
export const KRULES: StaticRule[] = [
  k.altMeaninglessRule,
  k.mediaTrackRule,
  k.tableCaptionRule,
  k.tableThMissingRule,
  k.tabindexPositiveRule,
  k.autoplayMediaRule,
  k.mouseOnlyHandlerRule,
  k.skipLinkFirstRule,
  k.skipTargetExistsRule,
  k.titleGenericRule,
  k.iframeTitleRule,
  k.linkTextGenericRule,
  k.langKoExpectedRule,
  k.newWindowNoticeRule,
  k.selectOnchangeRule,
  k.placeholderOnlyLabelRule,
  k.captchaDetectRule,
  k.parseErrorsRule,
];

/**
 * 규칙의 kwcag 귀속이 단일 소스 데이터(kwcag22.json)에 실재하는지 대조한다.
 * 존재하지 않는 검사항목에 귀속된 규칙이 있으면 던진다 — 기동 중단(ADR-04).
 */
export function validateRegistry(rules: StaticRule[], data: DataBundle): void {
  const unknown = rules.filter((r) => !data.kwcag22.findById(r.kwcag));
  if (unknown.length > 0) {
    const ids = unknown.map((r) => `${r.id} → ${r.kwcag}`).join(", ");
    throw new Error(`kwcag22.json에 없는 검사항목에 귀속된 규칙이 있습니다: ${ids}`);
  }
}
