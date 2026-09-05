import { createFinding } from "../../normalize/finding.js";
import { outlineNone } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

interface CssRuleLike {
  selectorText?: string;
  style?: { outline?: string; outlineWidth?: string; outlineStyle?: string; boxShadow?: string; border?: string; borderColor?: string; borderWidth?: string };
}

function removesOutline(style: NonNullable<CssRuleLike["style"]>): boolean {
  const outline = (style.outline ?? "").toLowerCase();
  const width = (style.outlineWidth ?? "").toLowerCase();
  const st = (style.outlineStyle ?? "").toLowerCase();
  return outline === "none" || outline === "0" || outline.startsWith("0 ") || width === "0" || width === "0px" || st === "none";
}

function hasAlternative(style: NonNullable<CssRuleLike["style"]>): boolean {
  const box = (style.boxShadow ?? "").trim();
  const border = (style.border ?? "").trim();
  const borderColor = (style.borderColor ?? "").trim();
  const borderWidth = (style.borderWidth ?? "").trim();
  return (box !== "" && box !== "none") || border !== "" || borderColor !== "" || (borderWidth !== "" && borderWidth !== "0");
}

export const rule: StaticRule = {
  id: "k-outline-none",
  kwcag: "6.1.2",
  wcag: ["2.4.7"],
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
        continue; // 접근 불가한 시트는 건너뛴다
      }
      if (!rules) continue;
      for (let j = 0; j < rules.length; j++) {
        const r = rules[j];
        const selector = r?.selectorText ?? "";
        if (!selector.includes(":focus") || !r?.style) continue;
        if (removesOutline(r.style) && !hasAlternative(r.style)) {
          findings.push(
            createFinding(rule, null, {
              message: outlineNone.message,
              fix: outlineNone.fix,
              outcome: "incomplete",
              selectorOverride: selector,
            }),
          );
        }
      }
    }
    return findings;
  },
};
