import { createFinding } from "../../normalize/finding.js";
import { downEventAction } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-down-event-action",
  kwcag: "6.5.2",
  wcag: ["2.5.2"],
  engine: "k",
  impact: "moderate",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const el of Array.from(ctx.document.querySelectorAll("[onmousedown],[onpointerdown],[ontouchstart]"))) {
      findings.push(
        createFinding(rule, el, { message: downEventAction.message, fix: downEventAction.fix, outcome: "incomplete" }),
      );
    }
    return findings;
  },
};
