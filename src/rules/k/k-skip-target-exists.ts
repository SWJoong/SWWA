import { createFinding } from "../../normalize/finding.js";
import { firstFocusable } from "../util/focusable.js";
import { skipTargetExists } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-skip-target-exists",
  kwcag: "6.4.1",
  wcag: ["2.4.1"],
  engine: "k",
  impact: "serious",
  confidence: "high",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const first = firstFocusable(ctx.document);
    if (!first || first.tagName.toLowerCase() !== "a") return [];
    const href = first.getAttribute("href") ?? "";
    if (!href.startsWith("#") || href.length <= 1) return [];
    const targetId = href.slice(1);
    const target = ctx.document.getElementById(targetId) ?? ctx.document.getElementsByName(targetId)[0];
    if (target) return [];
    return [
      createFinding(rule, first, { message: skipTargetExists.message(href), fix: skipTargetExists.fix, outcome: "fail" }),
    ];
  },
};
