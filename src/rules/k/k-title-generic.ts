import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { titleGeneric } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

function looksLikeSiteNameOnly(text: string): boolean {
  if (/[:\-–—]/.test(text)) return false; // "페이지 - 사이트명"처럼 구분자가 있으면 목적이 담긴 것으로 본다
  const words = text.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 3;
}

export const rule: StaticRule = {
  id: "k-title-generic",
  kwcag: "6.4.2",
  wcag: ["2.4.2"],
  engine: "k",
  impact: "moderate",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const titleEl = ctx.document.querySelector("title");
    if (!titleEl) return [];
    const text = normText(titleEl.textContent ?? "");
    const isGeneric = text === "" || /^(untitled|제목\s*없음)$/i.test(text) || looksLikeSiteNameOnly(text);
    if (!isGeneric) return [];
    return [
      createFinding(rule, titleEl, {
        message: titleGeneric.message(text || "(비어 있음)"),
        fix: titleGeneric.fix,
        outcome: "fail",
      }),
    ];
  },
};
