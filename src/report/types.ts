import type { Automation } from "../data/kwcag22.js";

export type Impact = "critical" | "serious" | "moderate" | "minor";
export type Confidence = "high" | "medium" | "low";
export type Outcome = "fail" | "incomplete";
export type FindingEngine = "k-rule" | "axe" | "b-rule";
export type EngineMode = "static" | "browser";
export type Verdict = "fail" | "needs-review" | "pass";
export type CheckpointStatus = "fail" | "incomplete" | "manual" | "pass" | "na";

/** 정규화된 검사 결과 1건(02-architecture §4). axe·k-규칙·b-규칙 결과가 모두 이 형태로 모인다. */
export interface Finding {
  ruleId: string;
  engine: FindingEngine;
  kwcag: string | null;
  wcag: string[];
  impact: Impact;
  outcome: Outcome;
  confidence: Confidence;
  selector: string;
  html: string;
  message: string;
  fix: string;
  helpUrl?: string;
}

export interface CheckpointResult {
  id: string;
  alias: string;
  name: string;
  automation: Automation;
  status: CheckpointStatus;
  findings: number;
}

export interface ReportSummary {
  fail: number;
  incomplete: number;
  manual: number;
  pass: number;
  na: number;
  byImpact: Record<Impact, number>;
  truncated: boolean;
}

export interface ManualChecklistItem {
  kwcag: string;
  alias: string;
  question: string;
}

export interface Report {
  engine: { name: "swwa"; version: string; axe: string; mode: EngineMode };
  target: { kind: "html" | "file" | "url"; ref: string; title?: string };
  verdict: Verdict;
  summary: ReportSummary;
  checkpoints: CheckpointResult[];
  findings: Finding[];
  manualChecklist: ManualChecklistItem[];
  notices: string[];
}
