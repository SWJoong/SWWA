import { createFinding } from "../../normalize/finding.js";
import { autoplayMedia } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-autoplay-media",
  kwcag: "5.4.2",
  wcag: ["1.4.2"],
  engine: "k",
  impact: "serious",
  confidence: "high",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const el of Array.from(ctx.document.querySelectorAll("video[autoplay], audio[autoplay]"))) {
      if (!el.hasAttribute("muted")) {
        findings.push(createFinding(rule, el, { message: autoplayMedia.message, fix: autoplayMedia.fix, outcome: "fail" }));
      }
    }
    for (const el of Array.from(ctx.document.querySelectorAll("bgsound"))) {
      findings.push(createFinding(rule, el, { message: autoplayMedia.message, fix: autoplayMedia.fix, outcome: "fail" }));
    }
    for (const el of Array.from(ctx.document.querySelectorAll("embed[src], iframe[src]"))) {
      const src = el.getAttribute("src") ?? "";
      if (/[?&]autoplay=(1|true)\b/i.test(src)) {
        findings.push(createFinding(rule, el, { message: autoplayMedia.message, fix: autoplayMedia.fix, outcome: "fail" }));
      }
    }
    return findings;
  },
};
