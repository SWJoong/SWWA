import { createFinding } from "../../normalize/finding.js";
import { firstFocusable } from "../util/focusable.js";
import { skipLinkFirst } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-skip-link-first",
  kwcag: "6.4.1",
  wcag: ["2.4.1"],
  engine: "k",
  impact: "serious",
  confidence: "high",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const first = firstFocusable(ctx.document);
    if (!first) return [];
    const href = first.getAttribute("href") ?? "";
    const isSameDocAnchor = first.tagName.toLowerCase() === "a" && href.startsWith("#") && href.length > 1;
    if (isSameDocAnchor) return [];
    return [createFinding(rule, first, { message: skipLinkFirst.message, fix: skipLinkFirst.fix, outcome: "fail" })];
  },
};
