import { createFinding } from "../../normalize/finding.js";
import { tableCaption } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-table-caption",
  kwcag: "5.3.1",
  wcag: ["1.3.1"],
  engine: "k",
  impact: "moderate",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const table of Array.from(ctx.document.querySelectorAll("table"))) {
      const role = table.getAttribute("role");
      if (role === "presentation" || role === "none") continue;
      if (!table.querySelector("th")) continue; // 데이터 표로 보이지 않으면 판단하지 않는다
      if (!table.querySelector("caption")) {
        findings.push(createFinding(rule, table, { message: tableCaption.message, fix: tableCaption.fix, outcome: "fail" }));
      }
    }
    return findings;
  },
};
