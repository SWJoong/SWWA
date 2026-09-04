import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { placeholderOnlyLabel } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-placeholder-only-label",
  kwcag: "7.3.2",
  wcag: ["3.3.2"],
  engine: "k",
  impact: "critical",
  confidence: "high",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    const labels = Array.from(ctx.document.querySelectorAll("label"));
    for (const input of Array.from(ctx.document.querySelectorAll("input[placeholder], textarea[placeholder]"))) {
      const id = input.getAttribute("id");
      const hasLabelFor = id !== null && labels.some((l) => l.getAttribute("for") === id);
      const hasAriaLabel = normText(input.getAttribute("aria-label") ?? "") !== "";
      const hasAriaLabelledby = (input.getAttribute("aria-labelledby") ?? "").trim() !== "";
      const wrappedInLabel = input.closest("label") !== null;
      if (hasLabelFor || hasAriaLabel || hasAriaLabelledby || wrappedInLabel) continue;
      findings.push(
        createFinding(rule, input, {
          message: placeholderOnlyLabel.message,
          fix: placeholderOnlyLabel.fix,
          outcome: "fail",
        }),
      );
    }
    return findings;
  },
};
