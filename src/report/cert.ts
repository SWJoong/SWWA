import type { DataBundle } from "../data/loader.js";
import type { CheckpointStatus } from "./types.js";
import type { Automation } from "../data/kwcag22.js";

/** estimate_cert_readiness 입력으로 쓰는 Report의 최소 형태(checkpoints만 필요). */
export interface CertInputReport {
  checkpoints: { id: string; status: CheckpointStatus }[];
}

export interface CertCheckpoint {
  id: string;
  alias: string;
  name: string;
  automation: Automation;
  pages: number;
  failingPages: number;
  complianceRate: number;
  status: CheckpointStatus;
}

export interface CertGap {
  id: string;
  failingPages: number;
  priority: number;
  reason: string;
}

export interface CertReadiness {
  checkpoints: CertCheckpoint[];
  overall: { autoCheckedCoverage: number; estimatedExpertRate: number; pagesAudited: number };
  gaps: CertGap[];
  manualRemaining: { id: string; name: string }[];
  notices: string[];
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
const pct = (n: number): number => Math.round(n * 100);

function aggregateStatus(
  statuses: CheckpointStatus[],
  automation: Automation,
  failingPages: number,
  incompletePages: number,
): CheckpointStatus {
  if (failingPages > 0) return "fail";
  if (incompletePages > 0) return "incomplete";
  if (statuses.some((s) => s === "pass")) return "pass";
  if (automation === "na") return "na";
  return "manual";
}

/**
 * 여러 페이지 Report를 검사항목별 준수율로 집계해 인증 준비도를 추정한다(FR-07, 02 §3.1).
 * 자동 검사만으로는 인증 통과를 판정할 수 없으며, estimatedExpertRate는 자동·보조 등급 항목만으로
 * 계산한 **추정치**다(notices에 고정 고지).
 */
export function estimateCertReadiness(
  reports: CertInputReport[],
  pageCount: number | undefined,
  data: DataBundle,
): CertReadiness {
  const pages = reports.length;
  const expertCriterion = data.certification.criteria.find((c) => c.kind === "expert");
  const expertThreshold = expertCriterion?.value ?? 0.95;

  const checkpoints: CertCheckpoint[] = data.kwcag22.checkpoints.map((cp) => {
    const statuses = reports.map(
      (r) => r.checkpoints.find((c) => c.id === cp.id)?.status ?? ("manual" as CheckpointStatus),
    );
    const failingPages = statuses.filter((s) => s === "fail").length;
    const incompletePages = statuses.filter((s) => s === "incomplete").length;
    const complianceRate = pages > 0 ? (pages - failingPages) / pages : 1;
    return {
      id: cp.id,
      alias: cp.alias,
      name: cp.name_ko,
      automation: cp.automation,
      pages,
      failingPages,
      complianceRate: round2(complianceRate),
      status: aggregateStatus(statuses, cp.automation, failingPages, incompletePages),
    };
  });

  const autoAssist = checkpoints.filter((c) => c.automation === "auto" || c.automation === "assist");
  const autoCheckedCoverage = round2(autoAssist.length / checkpoints.length);
  const estimatedExpertRate =
    autoAssist.length > 0
      ? round2(autoAssist.reduce((sum, c) => sum + c.complianceRate, 0) / autoAssist.length)
      : 1;

  const gaps: CertGap[] = autoAssist
    .filter((c) => c.complianceRate < expertThreshold)
    .sort((a, b) => b.failingPages - a.failingPages || a.complianceRate - b.complianceRate)
    .map((c, i) => ({
      id: c.id,
      failingPages: c.failingPages,
      priority: i + 1,
      reason: `${c.automation === "auto" ? "자동" : "보조"} 등급 항목 준수율 ${pct(c.complianceRate)}% < ${pct(expertThreshold)}%`,
    }));

  const manualRemaining = checkpoints
    .filter((c) => c.status === "manual")
    .map((c) => ({ id: c.id, name: c.name }));

  const criteriaText = data.certification.criteria
    .map((c) => c.text)
    .join(" · ");
  const notices = [
    `${criteriaText} 기준은 인증기관 공지로 재확인 필요(확인일: ${expertCriterion?.verifiedOn ?? "미확인"}).`,
    "estimatedExpertRate는 자동·보조 등급 항목만으로 계산한 추정치입니다.",
    "자동 검사 결과만으로 인증 통과를 판단할 수 없습니다. 수동·사용자 심사 항목이 남아 있습니다.",
  ];

  return {
    checkpoints,
    overall: { autoCheckedCoverage, estimatedExpertRate, pagesAudited: pageCount ?? pages },
    gaps,
    manualRemaining,
    notices,
  };
}
