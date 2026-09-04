import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { altMeaningless } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-alt-meaningless",
  kwcag: "5.1.1",
  wcag: ["1.1.1"],
  engine: "k",
  impact: "serious",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    const meaningless = new Set(ctx.data.wordlists.altText.meaningless.map((w) => w.toLowerCase()));
    const filenamePattern = new RegExp(ctx.data.wordlists.altText.filenamePattern, "i");
    for (const img of Array.from(ctx.document.querySelectorAll("img"))) {
      const alt = img.getAttribute("alt");
      if (alt === null) continue; // 속성 자체 부재는 axe image-alt가 담당
      const trimmed = normText(alt);
      if (trimmed === "") continue; // 빈 alt(장식용)는 유효한 기법
      const isMeaningless = meaningless.has(trimmed.toLowerCase()) || filenamePattern.test(trimmed);
      if (isMeaningless) {
        findings.push(
          createFinding(rule, img, {
            message: altMeaningless.message(alt),
            fix: altMeaningless.fix,
            outcome: "fail",
          }),
        );
      }
    }
    return findings;
  },
};
