import { createFinding } from "../../normalize/finding.js";
import { accesskey } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-accesskey",
  kwcag: "6.1.4",
  wcag: ["2.1.4"],
  engine: "k",
  impact: "minor",
  confidence: "medium",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const el of Array.from(ctx.document.querySelectorAll("[accesskey]"))) {
      const key = el.getAttribute("accesskey") ?? "";
      findings.push(
        createFinding(rule, el, { message: accesskey.message(key), fix: accesskey.fix, outcome: "incomplete" }),
      );
    }
    return findings;
  },
};
