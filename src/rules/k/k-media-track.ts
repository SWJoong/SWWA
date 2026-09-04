import { createFinding } from "../../normalize/finding.js";
import { mediaTrack } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-media-track",
  kwcag: "5.2.1",
  wcag: ["1.2.1", "1.2.2", "1.2.3"],
  engine: "k",
  impact: "serious",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const video of Array.from(ctx.document.querySelectorAll("video"))) {
      const hasCaptions = Array.from(video.querySelectorAll("track")).some(
        (t) => (t.getAttribute("kind") ?? "").toLowerCase() === "captions",
      );
      if (!hasCaptions) {
        findings.push(createFinding(rule, video, { message: mediaTrack.message, fix: mediaTrack.fix, outcome: "fail" }));
      }
    }
    return findings;
  },
};
