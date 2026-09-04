import { createFinding } from "../../normalize/finding.js";
import { tabindexPositive } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-tabindex-positive",
  kwcag: "5.3.2",
  wcag: ["1.3.2"],
  engine: "k",
  impact: "moderate",
  confidence: "high",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const el of Array.from(ctx.document.querySelectorAll("[tabindex]"))) {
      const value = el.getAttribute("tabindex") ?? "";
      const n = Number(value);
      if (!Number.isNaN(n) && n > 0) {
        findings.push(
          createFinding(rule, el, { message: tabindexPositive.message(value), fix: tabindexPositive.fix, outcome: "fail" }),
        );
      }
    }
    return findings;
  },
};
