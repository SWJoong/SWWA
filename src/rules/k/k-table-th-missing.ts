import { createFinding } from "../../normalize/finding.js";
import { tableThMissing } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

export const rule: StaticRule = {
  id: "k-table-th-missing",
  kwcag: "5.3.1",
  wcag: ["1.3.1"],
  engine: "k",
  impact: "serious",
  confidence: "medium",
  tier: "T1",
  run(ctx: StaticContext): Finding[] {
    const findings: Finding[] = [];
    for (const table of Array.from(ctx.document.querySelectorAll("table"))) {
      const role = table.getAttribute("role");
      if (role === "presentation" || role === "none") continue;
      if (table.querySelector("th")) continue;
      const rows = Array.from(table.querySelectorAll("tr"));
      const looksLikeDataTable = rows.length >= 2 && rows.every((r) => r.querySelectorAll("td").length >= 2);
      if (looksLikeDataTable) {
        findings.push(createFinding(rule, table, { message: tableThMissing.message, fix: tableThMissing.fix, outcome: "fail" }));
      }
    }
    return findings;
  },
};
