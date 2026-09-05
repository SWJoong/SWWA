// 브라우저 규칙 테스트 공통 헬퍼(04-qa-plan §1). 로컬 정적 서버로 픽스처 페이지를 서빙하고
// 실제 Chrome/Edge로 연다. browser_status.available=false면 스킵하되, CI에서는
// SWWA_BROWSER_TESTS=1로 스킵을 금지해 브라우저 미설치를 무음 처리하지 않는다.
import { chromium, type Page, type Browser } from "playwright-core";
import { detectBrowser } from "../../src/engine/browser-detect.js";
import { loadDataBundle } from "../../src/data/loader.js";
import { startFixtureServer } from "../../scripts/serve-fixtures.mjs";
import type { BrowserContext } from "../../src/rules/types.js";
import type { Viewport } from "../../src/engine/browser.js";

const data = loadDataBundle();

type ServerHandle = { port: number; close: () => Promise<void> };
let serverPromise: Promise<ServerHandle> | null = null;
function getServer(): Promise<ServerHandle> {
  if (serverPromise === null) {
    serverPromise = startFixtureServer(0);
  }
  // 모듈 스코프 변수는 함수 경계를 넘는 좁히기를 TS가 신뢰하지 않는다 — 위에서 채웠음을 알기에 단언한다.
  return serverPromise as Promise<ServerHandle>;
}

export async function fixtureUrl(path: string): Promise<string> {
  const { port } = await getServer();
  return `http://127.0.0.1:${port}/${path}`;
}

export interface PageSession {
  page: Page;
  ctx: BrowserContext;
  close: () => Promise<void>;
}

const VIEWPORT_SIZES: Record<Viewport, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 812 },
};

export async function openFixturePage(path: string, viewport: Viewport = "desktop"): Promise<PageSession> {
  const url = await fixtureUrl(path);
  const browser: Browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT_SIZES[viewport] });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(100);
  return {
    page,
    ctx: { page, data, viewport },
    close: async () => {
      await browser.close();
    },
  };
}

export async function isBrowserAvailable(): Promise<boolean> {
  const status = await detectBrowser();
  return status.available;
}

/** describe를 브라우저 가용성에 따라 실행하거나 건너뛴다(CI는 SWWA_BROWSER_TESTS=1로 강제). */
export async function describeBrowser(name: string, fn: () => void): Promise<void> {
  const available = await isBrowserAvailable();
  const forceRun = process.env.SWWA_BROWSER_TESTS === "1";
  if (available || forceRun) {
    describe(name, fn);
  } else {
    describe.skip(name, fn);
  }
}
