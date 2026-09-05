import { createFinding } from "../../normalize/finding.js";
import { flashAnimation } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

interface CssRuleLike {
  selectorText?: string;
  style?: { animation?: string; animationDuration?: string; animationIterationCount?: string };
}

/** "0.2s"·"200ms" 같은 시간 토큰을 초 단위로 파싱. 없으면 null. */
function parseSeconds(token: string): number | null {
  const m = /(\d*\.?\d+)\s*(ms|s)\b/.exec(token);
  if (!m) return null;
  const v = parseFloat(m[1] as string);
  return m[2] === "ms" ? v / 1000 : v;
}

const FLASH_THRESHOLD_S = 0.33; // 초당 3회 이상 → 주기 0.33초 미만

export const rule: StaticRule = {
  id: "k-flash-animation",
  kwcag: "6.3.1",
  wcag: ["2.3.1"],
  engine: "k",
  impact: "serious",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    const sheets = ctx.document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      let rules: ArrayLike<CssRuleLike>;
      try {
        rules = sheets[i]?.cssRules as unknown as ArrayLike<CssRuleLike>;
      } catch {
        continue;
      }
      if (!rules) continue;
      for (let j = 0; j < rules.length; j++) {
        const r = rules[j];
        if (!r?.style) continue;
        const shorthand = (r.style.animation ?? "").toLowerCase();
        const iter = (r.style.animationIterationCount ?? "").toLowerCase();
        const durLong = r.style.animationDuration ?? "";
        const infinite = shorthand.includes("infinite") || iter.includes("infinite");
        if (!infinite) continue;
        const seconds = parseSeconds(durLong) ?? parseSeconds(shorthand);
        if (seconds !== null && seconds > 0 && seconds < FLASH_THRESHOLD_S) {
          findings.push(
            createFinding(rule, null, {
              message: flashAnimation.message,
              fix: flashAnimation.fix,
              outcome: "incomplete",
              selectorOverride: r.selectorText ?? "(animation)",
            }),
          );
        }
      }
    }
    return findings;
  },
};
