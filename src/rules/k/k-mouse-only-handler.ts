import { createFinding } from "../../normalize/finding.js";
import { mouseOnlyHandler } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

const NATIVELY_INTERACTIVE_TAGS = new Set(["a", "button", "select", "textarea", "input", "label"]);

export const rule: StaticRule = {
  id: "k-mouse-only-handler",
  kwcag: "6.1.1",
  wcag: ["2.1.1"],
  engine: "k",
  impact: "critical",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const el of Array.from(ctx.document.querySelectorAll("[onclick], [onmouseover]"))) {
      const tag = el.tagName.toLowerCase();
      if (NATIVELY_INTERACTIVE_TAGS.has(tag)) continue;
      const hasRole = el.getAttribute("role") !== null;
      const hasTabindex = el.getAttribute("tabindex") !== null;
      if (hasRole && hasTabindex) continue; // 키보드 접근 가능하도록 보완된 것으로 본다
      findings.push(
        createFinding(rule, el, { message: mouseOnlyHandler.message, fix: mouseOnlyHandler.fix, outcome: "fail" }),
      );
    }
    return findings;
  },
};
