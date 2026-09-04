import type { DOMWindow } from "jsdom";
import type { DataBundle } from "../data/loader.js";
import type { Finding, Impact, Confidence } from "../report/types.js";

export type Tier = "T1" | "T2" | "B";

export interface RuleMeta {
  id: string;
  kwcag: string;
  wcag: string[];
  engine: "k" | "b";
  impact: Impact;
  confidence: Confidence;
  tier: Tier;
}

export interface StaticContext {
  document: Document;
  window: DOMWindow;
  html: string;
  baseUrl?: string;
  data: DataBundle;
}

export interface StaticRule extends RuleMeta {
  engine: "k";
  run(ctx: StaticContext): Finding[];
}
