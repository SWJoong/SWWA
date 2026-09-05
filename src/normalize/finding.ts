import { cssPath } from "../rules/util/selector.js";
import type { RuleMeta } from "../rules/types.js";
import type { Confidence, Finding, FindingEngine, Outcome } from "../report/types.js";

const HTML_SNIPPET_MAX = 300;

const ENGINE_MAP: Record<RuleMeta["engine"], FindingEngine> = {
  k: "k-rule",
  b: "b-rule",
};

export interface CreateFindingOptions {
  message: string;
  fix: string;
  outcome: Outcome;
  confidence?: Confidence;
  helpUrl?: string;
  /** 요소가 아니라 위치(파일 내 line·col)로만 가리켜야 하는 경우(k-parse-errors)에 선택자 대신 사용. */
  selectorOverride?: string;
  /** b-규칙처럼 el이 jsdom Element가 아니라 브라우저 쪽에서 계산한 HTML 문자열일 때 사용. */
  htmlOverride?: string;
}

/** k-/b- 규칙 결과를 Finding으로 정규화하는 유일한 통로다(03 §7). */
export function createFinding(rule: RuleMeta, el: Element | null, opts: CreateFindingOptions): Finding {
  return {
    ruleId: rule.id,
    engine: ENGINE_MAP[rule.engine],
    kwcag: rule.kwcag,
    wcag: rule.wcag,
    impact: rule.impact,
    outcome: opts.outcome,
    confidence: opts.confidence ?? rule.confidence,
    selector: opts.selectorOverride ?? (el ? cssPath(el) : ""),
    html: opts.htmlOverride ?? (el ? el.outerHTML.slice(0, HTML_SNIPPET_MAX) : ""),
    message: opts.message,
    fix: opts.fix,
    helpUrl: opts.helpUrl,
  };
}
