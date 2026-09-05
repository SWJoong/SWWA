import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { sessionTimeoutHint } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

const PATTERN = /자동\s*로그아웃|세션\s*(만료|종료|연장)|로그인\s*시간|(\d+\s*분)\s*(후|동안).*(로그아웃|만료)/;

export const rule: StaticRule = {
  id: "k-session-timeout-hint",
  kwcag: "6.2.1",
  wcag: ["2.2.1"],
  engine: "k",
  impact: "moderate",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    const body = ctx.document.body;
    if (!body) return [];
    // 문서 전체 텍스트에서 한 번만 판정한다(문구 존재 → 연장 수단 확인 필요).
    for (const el of Array.from(body.querySelectorAll("p, li, span, div, strong, em"))) {
      if (el.children.length > 0) continue;
      const text = normText(el.textContent ?? "");
      if (PATTERN.test(text)) {
        return [createFinding(rule, el, { message: sessionTimeoutHint.message, fix: sessionTimeoutHint.fix, outcome: "incomplete" })];
      }
    }
    return [];
  },
};
