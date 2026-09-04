import { createFinding } from "../../normalize/finding.js";
import { normText, hangulRatio } from "../util/text.js";
import { langKoExpected } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

const HANGUL_THRESHOLD = 0.3;

export const rule: StaticRule = {
  id: "k-lang-ko-expected",
  kwcag: "7.1.1",
  wcag: ["3.1.1"],
  engine: "k",
  impact: "serious",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const lang = (ctx.document.documentElement.getAttribute("lang") ?? "").toLowerCase();
    if (lang.startsWith("ko")) return [];
    const text = normText(ctx.document.body?.textContent ?? "");
    if (hangulRatio(text) < HANGUL_THRESHOLD) return [];
    return [
      createFinding(rule, ctx.document.documentElement, {
        message: langKoExpected.message(lang || "(없음)"),
        fix: langKoExpected.fix,
        outcome: "fail",
      }),
    ];
  },
};
