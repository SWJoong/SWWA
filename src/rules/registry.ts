import * as k from "./k/index.js";
import * as b from "./b/index.js";
import type { RuleMeta, StaticRule, BrowserRule } from "./types.js";
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

/** T2 정적 규칙(휴리스틱, 단일 소스 §5). 대부분 outcome incomplete(사람 확인 필요). */
export const T2RULES: StaticRule[] = [
  k.sensoryInstructionRule,
  k.outlineNoneRule,
  k.accesskeyRule,
  k.sessionTimeoutHintRule,
  k.carouselNoPauseRule,
  k.flashAnimationRule,
  k.linkSameTextDiffHrefRule,
  k.gestureListenerRule,
  k.downEventActionRule,
  k.deviceMotionRule,
  k.onloadPopupRule,
  k.errorAssociationRule,
  k.autocompleteMissingRule,
];

/** 정적 엔진이 실행하는 전체 k-규칙(T1 + T2). */
export const ALL_K_RULES: StaticRule[] = [...KRULES, ...T2RULES];

/** 브라우저 규칙 6개(§5 B tier). 백로그 b-widget-keyboard는 아직 구현하지 않는다. */
export const BRULES: BrowserRule[] = [
  b.focusVisibleRule,
  b.focusOrderRule,
  b.skipLinkWorksRule,
  b.targetSize6mmRule,
  b.keyboardReachableRule,
  b.motionRuntimeRule,
];

/**
 * 규칙의 kwcag 귀속이 단일 소스 데이터(kwcag22.json)에 실재하는지 대조한다.
 * 존재하지 않는 검사항목에 귀속된 규칙이 있으면 던진다 — 기동 중단(ADR-04).
 */
export function validateRegistry(rules: RuleMeta[], data: DataBundle): void {
  const unknown = rules.filter((r) => !data.kwcag22.findById(r.kwcag));
  if (unknown.length > 0) {
    const ids = unknown.map((r) => `${r.id} → ${r.kwcag}`).join(", ");
    throw new Error(`kwcag22.json에 없는 검사항목에 귀속된 규칙이 있습니다: ${ids}`);
  }
}
