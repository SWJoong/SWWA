import { createFinding } from "../../normalize/finding.js";
import { selectOnchange } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-select-onchange",
  kwcag: "7.2.1",
  wcag: ["3.2.1", "3.2.2"],
  engine: "k",
  impact: "moderate",
  confidence: "low",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const select of Array.from(ctx.document.querySelectorAll("select[onchange]"))) {
      findings.push(
        createFinding(rule, select, { message: selectOnchange.message, fix: selectOnchange.fix, outcome: "incomplete" }),
      );
    }
    return findings;
  },
};
