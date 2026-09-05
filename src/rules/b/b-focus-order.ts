import { createFinding } from "../../normalize/finding.js";
import { tabTraversal } from "../util/browser-dom.js";
import { bFocusOrder } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { BrowserContext, BrowserRule } from "../types.js";

export const rule: BrowserRule = {
  id: "b-focus-order",
  kwcag: "6.1.2",
  wcag: ["2.4.3"],
  engine: "b",
  impact: "moderate",
  confidence: "high",
  tier: "B",
  async run(ctx: BrowserContext): Promise<Finding[]> {
    const stops = await tabTraversal(ctx.page, 100);
    const findings: Finding[] = [];
    let maxSeenIndex = -1;
    for (const stop of stops) {
      if (stop.domIndex < maxSeenIndex) {
        findings.push(
          createFinding(rule, null, {
            message: bFocusOrder.message,
            fix: bFocusOrder.fix,
            outcome: "fail",
            selectorOverride: stop.selector,
            htmlOverride: stop.html,
          }),
        );
      } else {
        maxSeenIndex = stop.domIndex;
      }
    }
    return findings;
  },
};
