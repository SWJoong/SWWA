import type { DataBundle } from "../data/loader.js";
import { computeCheckpoints } from "../normalize/checkpoints.js";
import type {
  CheckpointResult,
  EngineMode,
  Finding,
  Impact,
  ManualChecklistItem,
  ReportSummary,
  Verdict,
} from "./types.js";

const IMPACT_ORDER: Record<Impact, number> = { critical: 0, serious: 1, moderate: 2, minor: 3 };

/** verdict: fail=자동 등급 규칙 fail≥1 · needs-review=보조 등급 fail 또는 incomplete만 · pass=둘 다 없음(02 §4). */
export function computeVerdict(checkpoints: CheckpointResult[]): Verdict {
  const autoFail = checkpoints.some((cp) => cp.automation === "auto" && cp.status === "fail");
  if (autoFail) return "fail";
  const needsReview = checkpoints.some(
    (cp) => (cp.automation === "assist" && cp.status === "fail") || cp.status === "incomplete",
  );
  if (needsReview) return "needs-review";
  return "pass";
}

function summarizeFindings(checkpoints: CheckpointResult[], findings: Finding[], truncated: boolean): ReportSummary {
  const tally = { fail: 0, incomplete: 0, manual: 0, pass: 0, na: 0 };
  for (const cp of checkpoints) tally[cp.status] += 1;
  const byImpact: Record<Impact, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const f of findings) {
    if (f.outcome === "fail") byImpact[f.impact] += 1;
  }
  return { ...tally, byImpact, truncated };
}

function buildManualChecklist(checkpoints: CheckpointResult[], data: DataBundle): ManualChecklistItem[] {
  return checkpoints
    .filter((cp) => cp.status === "manual")
    .map((cp): ManualChecklistItem => {
      const full = data.kwcag22.findById(cp.id);
      return { kwcag: cp.id, alias: cp.alias, question: full?.testMethod_ko[0] ?? full?.summary_ko ?? cp.name };
    });
}

function buildNotices(mode: EngineMode, truncated: boolean): string[] {
  const notices = [
    "자동 검사는 33개 검사항목 중 일부만 판정합니다. 인증 통과 여부는 전문가·사용자 심사로 결정됩니다.",
  ];
  if (mode === "static") {
    notices.push(
      "정적 검사는 렌더링이 필요한 항목(명도 대비·초점 표시·타깃 크기 등)을 판정하지 못합니다. 브라우저 감사(audit_url)로 보완하세요.",
    );
  }
  if (truncated) {
    notices.push("Finding이 maxFindings를 초과해 일부가 생략되었습니다. impact·검사항목 순으로 상위 항목만 표시합니다.");
  }
  return notices;
}

export interface SummarizeResult {
  verdict: Verdict;
  summary: ReportSummary;
  checkpoints: CheckpointResult[];
  findings: Finding[];
  manualChecklist: ManualChecklistItem[];
  notices: string[];
}

/**
 * Finding[] → Report의 나머지 필드(verdict·summary·checkpoints·manualChecklist·notices)를 만든다.
 * 33항목 status는 항상 전체 findings 기준으로 계산하고(truncated 여부와 무관하게 정확해야 한다),
 * 응답에 담을 findings만 impact·개수 순으로 절단한다.
 */
export function summarize(
  findings: Finding[],
  mode: EngineMode,
  data: DataBundle,
  maxFindings: number,
): SummarizeResult {
  const checkpoints = computeCheckpoints(findings, mode, data);
  const verdict = computeVerdict(checkpoints);
  const truncated = findings.length > maxFindings;
  const limited = [...findings]
    .sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact])
    .slice(0, maxFindings);
  const summary = summarizeFindings(checkpoints, findings, truncated);
  const manualChecklist = buildManualChecklist(checkpoints, data);
  const notices = buildNotices(mode, truncated);
  return { verdict, summary, checkpoints, findings: limited, manualChecklist, notices };
}
