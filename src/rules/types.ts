import type { DOMWindow } from "jsdom";
import type { Page } from "playwright-core";
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

export interface BrowserContext {
  page: Page;
  data: DataBundle;
  viewport: "desktop" | "mobile";
  /** b-motion-runtime의 관찰 시간(ms). 테스트에서 짧게 줄여 검증한다. 기본 5000. */
  motionObserveMs?: number;
}

export interface BrowserRule extends RuleMeta {
  engine: "b";
  run(ctx: BrowserContext): Promise<Finding[]>;
}
