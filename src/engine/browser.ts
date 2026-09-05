import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { AxeBuilder } from "@axe-core/playwright";
import { detectBrowser } from "./browser-detect.js";
import { normalizeAxeResults } from "../normalize/axe.js";
import { BRULES } from "../rules/registry.js";
import type { BrowserContext as BRuleContext } from "../rules/types.js";
import type { DataBundle } from "../data/loader.js";
import type { Finding } from "../report/types.js";

export type Viewport = "desktop" | "mobile";
export type CheckKind = "axe" | "b-rules" | "keyboard";

/** "keyboard" 체크 = Tab 순회 기반 초점 표시·순서·바로가기 동작(§3.1 audit_url). 나머지는 "b-rules". */
const KEYBOARD_RULE_IDS = new Set(["b-focus-visible", "b-focus-order", "b-skip-link-works"]);
const EXPERIMENTAL_AXE_RULES = ["label-content-name-mismatch"];
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const VIEWPORTS: Record<Viewport, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 812 },
};

export class NoBrowserError extends Error {}
export class NavigationError extends Error {}
export class BrowserTimeoutError extends Error {}

export interface RunBrowserOptions {
  url: string;
  viewport?: Viewport;
  waitFor?: "load" | "networkidle" | string;
  timeoutMs?: number;
  checks?: CheckKind[];
  headers?: Record<string, string>;
  excludeRules?: string[];
  screenshot?: boolean;
  outputDir?: string;
  data: DataBundle;
}

export interface RunBrowserResult {
  findings: Finding[];
  title?: string;
  finalUrl: string;
  browser: { channel: string; version: string };
  screenshotPath?: string;
}

/**
 * playwright-core + @axe-core/playwright + b-규칙으로 브라우저 감사를 수행한다(03 §6).
 * 도구 호출마다 브라우저를 새로 열고 닫는다(단순·안전, 성능 개선은 백로그).
 */
export async function runBrowser(opts: RunBrowserOptions): Promise<RunBrowserResult> {
  const status = await detectBrowser();
  if (!status.available || !status.channel) {
    throw new NoBrowserError(status.installHint);
  }

  const browser = await chromium.launch(
    status.channel === "chromium" ? { headless: true } : { channel: status.channel, headless: true },
  );

  try {
    const viewport = opts.viewport ?? "desktop";
    const context = await browser.newContext({
      viewport: VIEWPORTS[viewport],
      isMobile: viewport === "mobile",
      hasTouch: viewport === "mobile",
      extraHTTPHeaders: opts.headers,
      ignoreHTTPSErrors: false,
    });
    const page = await context.newPage();
    const timeoutMs = opts.timeoutMs ?? 30000;

    try {
      const waitUntil = opts.waitFor === "networkidle" ? "networkidle" : "load";
      await page.goto(opts.url, { timeout: timeoutMs, waitUntil });
      if (opts.waitFor && opts.waitFor !== "load" && opts.waitFor !== "networkidle") {
        await page.waitForSelector(opts.waitFor, { timeout: timeoutMs });
      }
      await page.waitForTimeout(500); // waitFor 이후 렌더링 안정화 여유
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/timeout/i.test(message)) throw new BrowserTimeoutError(message);
      throw new NavigationError(message);
    }

    const checks = opts.checks ?? ["axe", "b-rules", "keyboard"];
    const findings: Finding[] = [];
    const excludeRules = opts.excludeRules ?? [];

    if (checks.includes("axe")) {
      const mainResults = await new AxeBuilder({ page })
        .withTags(TAGS)
        .disableRules(excludeRules)
        .options({ resultTypes: ["violations", "incomplete"] })
        .analyze();
      findings.push(
        ...normalizeAxeResults(
          mainResults as unknown as Parameters<typeof normalizeAxeResults>[0],
          opts.data.axeRuleMap,
          opts.data.wcag22,
        ),
      );

      const experimentalIds = EXPERIMENTAL_AXE_RULES.filter((id) => !excludeRules.includes(id));
      if (experimentalIds.length > 0) {
        const experimentalResults = await new AxeBuilder({ page })
          .withRules(experimentalIds)
          .options({ resultTypes: ["violations", "incomplete"] })
          .analyze();
        findings.push(
          ...normalizeAxeResults(
            experimentalResults as unknown as Parameters<typeof normalizeAxeResults>[0],
            opts.data.axeRuleMap,
            opts.data.wcag22,
          ),
        );
      }
    }

    const activeRuleIds = new Set<string>();
    if (checks.includes("keyboard")) for (const id of KEYBOARD_RULE_IDS) activeRuleIds.add(id);
    if (checks.includes("b-rules")) {
      for (const rule of BRULES) if (!KEYBOARD_RULE_IDS.has(rule.id)) activeRuleIds.add(rule.id);
    }

    const ruleCtx: BRuleContext = { page, data: opts.data, viewport };
    for (const rule of BRULES) {
      if (!activeRuleIds.has(rule.id) || excludeRules.includes(rule.id)) continue;
      try {
        findings.push(...(await rule.run(ruleCtx)));
      } catch {
        // 규칙별 실패 격리(03 §6) — 개별 규칙 오류가 전체 리포트를 막지 않는다.
      }
    }

    let screenshotPath: string | undefined;
    if (opts.screenshot && opts.outputDir) {
      mkdirSync(opts.outputDir, { recursive: true });
      screenshotPath = join(opts.outputDir, `screenshot-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    return {
      findings,
      title: (await page.title()) || undefined,
      finalUrl: page.url(),
      browser: { channel: status.channel, version: status.version ?? "" },
      screenshotPath,
    };
  } finally {
    await browser.close();
  }
}
