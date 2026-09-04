import type { Report } from "./types.js";

const VERDICT_KO: Record<Report["verdict"], string> = {
  fail: "실패",
  "needs-review": "검토 필요",
  pass: "통과",
};

/** 도구 응답의 content(한국어 요약)를 만든다(03 §8: 판정 → 항목별 상태 → 상위 Finding → 수동 확인 → notices). */
export function formatReportText(report: Report): string {
  const lines: string[] = [
    `판정: ${VERDICT_KO[report.verdict]}`,
    `요약: fail ${report.summary.fail} · incomplete ${report.summary.incomplete} · manual ${report.summary.manual} · pass ${report.summary.pass} · na ${report.summary.na}`,
  ];

  const attention = report.checkpoints.filter((cp) => cp.status === "fail" || cp.status === "incomplete");
  if (attention.length > 0) {
    lines.push("", "검사항목별 상태:");
    for (const cp of attention) lines.push(`- ${cp.id}(${cp.alias}) ${cp.name}: ${cp.status}`);
  }

  const top = report.findings.slice(0, 10);
  if (top.length > 0) {
    lines.push("", "상위 Finding:");
    for (const f of top) lines.push(`- [${f.impact}] ${f.ruleId} ${f.selector}: ${f.message}`);
  }

  if (report.manualChecklist.length > 0) {
    lines.push("", "수동 확인이 필요한 항목:");
    for (const m of report.manualChecklist) lines.push(`- ${m.kwcag}(${m.alias}): ${m.question}`);
  }

  if (report.notices.length > 0) {
    lines.push("", "안내:");
    for (const n of report.notices) lines.push(`- ${n}`);
  }

  return lines.join("\n");
}
