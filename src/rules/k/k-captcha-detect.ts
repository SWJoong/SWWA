import { createFinding } from "../../normalize/finding.js";
import { captchaDetect } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

const KEYWORD_PATTERN = /captcha/i;

export const rule: StaticRule = {
  id: "k-captcha-detect",
  kwcag: "7.3.3",
  wcag: ["3.3.8"],
  engine: "k",
  impact: "moderate",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const el of Array.from(ctx.document.querySelectorAll("*"))) {
      const cls = el.getAttribute("class") ?? "";
      const id = el.getAttribute("id") ?? "";
      if (KEYWORD_PATTERN.test(cls) || KEYWORD_PATTERN.test(id)) {
        findings.push(
          createFinding(rule, el, { message: captchaDetect.message, fix: captchaDetect.fix, outcome: "incomplete" }),
        );
      }
    }
    return findings;
  },
};
