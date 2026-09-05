import { createFinding } from "../../normalize/finding.js";
import { normText } from "../util/text.js";
import { errorAssociation } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-error-association",
  kwcag: "7.3.1",
  wcag: ["3.3.1"],
  engine: "k",
  impact: "moderate",
  confidence: "medium",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const el of Array.from(ctx.document.querySelectorAll('[aria-invalid="true"]'))) {
      const describedby = (el.getAttribute("aria-describedby") ?? "").trim();
      let associated = false;
      if (describedby !== "") {
        // 참조 id가 실제로 존재하고 내용이 있으면 연결된 것으로 본다.
        associated = describedby.split(/\s+/).some((id) => {
          const target = ctx.document.getElementById(id);
          return target !== null && normText(target.textContent ?? "") !== "";
        });
      }
      if (!associated) {
        findings.push(
          createFinding(rule, el, { message: errorAssociation.message, fix: errorAssociation.fix, outcome: "incomplete" }),
        );
      }
    }
    return findings;
  },
};
