import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { iframeTitle } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-iframe-title",
  kwcag: "6.4.2",
  wcag: ["2.4.2"],
  engine: "k",
  impact: "serious",
  confidence: "high",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const iframe of Array.from(ctx.document.querySelectorAll("iframe"))) {
      const title = normText(iframe.getAttribute("title") ?? "");
      if (title === "") {
        findings.push(createFinding(rule, iframe, { message: iframeTitle.message, fix: iframeTitle.fix, outcome: "fail" }));
      }
    }
    return findings;
  },
};
