import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { linkTextGeneric } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-link-text-generic",
  kwcag: "6.4.3",
  wcag: ["2.4.4"],
  engine: "k",
  impact: "moderate",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    const generic = ctx.data.wordlists.linkText.generic.map((w) => w.toLowerCase());
    for (const a of Array.from(ctx.document.querySelectorAll("a[href]"))) {
      const ariaLabel = normText(a.getAttribute("aria-label") ?? "");
      if (ariaLabel !== "") continue; // aria-label로 보완되면 통과
      const rawText = normText(a.textContent ?? "");
      if (rawText === "") continue;
      if (generic.includes(rawText.toLowerCase())) {
        findings.push(
          createFinding(rule, a, { message: linkTextGeneric.message(rawText), fix: linkTextGeneric.fix, outcome: "fail" }),
        );
      }
    }
    return findings;
  },
};
