import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { newWindowNotice } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

const NOTICE_PATTERN = /새\s*창|새창|새\s*탭|new window/i;

export const rule: StaticRule = {
  id: "k-new-window-notice",
  kwcag: "7.2.1",
  wcag: ["3.2.1", "3.2.2"],
  engine: "k",
  impact: "moderate",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const a of Array.from(ctx.document.querySelectorAll('a[target="_blank"]'))) {
      const text = normText(a.textContent ?? "");
      const ariaLabel = a.getAttribute("aria-label") ?? "";
      const title = a.getAttribute("title") ?? "";
      const combined = `${text} ${ariaLabel} ${title}`;
      if (!NOTICE_PATTERN.test(combined)) {
        findings.push(
          createFinding(rule, a, { message: newWindowNotice.message, fix: newWindowNotice.fix, outcome: "fail" }),
        );
      }
    }
    return findings;
  },
};
