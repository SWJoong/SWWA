import type { Checkpoint } from "../data/kwcag22.js";
import type { DataBundle } from "../data/loader.js";
import type { CheckpointResult, CheckpointStatus, EngineMode, Finding } from "../report/types.js";

/** 이 모드에서 실제로 실행될 수 있는(=판정에 기여할 수 있는) 규칙 수(02 §4 status 규칙 4). */
function activeRuleCount(cp: Checkpoint, mode: EngineMode, data: DataBundle): number {
  if (mode === "static") {
    const activeAxe = cp.axeRules.filter((id) => !data.axeRuleMap[id]?.staticDisabled).length;
    return activeAxe + cp.kRules.length;
  }
  return cp.axeRules.length + cp.bRules.length;
}

/**
 * Finding[]으로부터 33개 검사항목의 status를 계산한다(02-architecture §4 5규칙, 항상 단일
 * 소스 순서로 33개를 반환한다).
 */
export function computeCheckpoints(findings: Finding[], mode: EngineMode, data: DataBundle): CheckpointResult[] {
  const byKwcag = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!f.kwcag) continue;
    const list = byKwcag.get(f.kwcag);
    if (list) list.push(f);
    else byKwcag.set(f.kwcag, [f]);
  }

  return data.kwcag22.checkpoints.map((cp): CheckpointResult => {
    const cpFindings = byKwcag.get(cp.id) ?? [];
    const hasFail = cpFindings.some((f) => f.outcome === "fail");
    const hasIncomplete = cpFindings.some((f) => f.outcome === "incomplete");

    let status: CheckpointStatus;
    if (hasFail) status = "fail";
    else if (hasIncomplete) status = "incomplete";
    else if (activeRuleCount(cp, mode, data) > 0) status = "pass";
    else status = cp.automation === "na" ? "na" : "manual";

    return {
      id: cp.id,
      alias: cp.alias,
      name: cp.name_ko,
      automation: cp.automation,
      status,
      findings: cpFindings.length,
    };
  });
}
