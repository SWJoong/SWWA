import { chromium } from "playwright-core";

export type BrowserChannel = "chrome" | "msedge" | "chromium";

export interface BrowserStatus {
  available: boolean;
  channel: BrowserChannel | null;
  version?: string;
  executablePath?: string;
  installHint: string;
}

const INSTALL_HINT = "Chrome 또는 Edge를 설치하거나 `npx playwright install chromium`을 실행하세요.";

let cached: BrowserStatus | undefined;

async function tryLaunch(channel: BrowserChannel | undefined): Promise<BrowserStatus | null> {
  let browser;
  try {
    browser = await chromium.launch(channel ? { channel, headless: true } : { headless: true });
  } catch {
    return null;
  }
  try {
    return {
      available: true,
      channel: channel ?? "chromium",
      version: browser.version(),
      // channel 기반 실행(chrome·msedge)은 실제 실행 파일 경로를 조회하는 공개 API가 없다
      // (playwright-core의 executablePath()는 번들 chromium 전용). 번들 chromium일 때만 채운다.
      executablePath: channel ? undefined : chromium.executablePath(),
      installHint: INSTALL_HINT,
    };
  } finally {
    await browser.close();
  }
}

/**
 * 설치된 Chrome → Edge → Playwright 번들 chromium 순으로 채널을 탐지한다(ADR-03).
 * 프로세스 내 캐시하며, `refresh: true`일 때만 재탐지한다(§3.1 browser_status).
 */
export async function detectBrowser(options?: { refresh?: boolean }): Promise<BrowserStatus> {
  if (cached && !options?.refresh) return cached;
  for (const channel of ["chrome", "msedge", undefined] as const) {
    const result = await tryLaunch(channel);
    if (result) {
      cached = result;
      return cached;
    }
  }
  cached = { available: false, channel: null, installHint: INSTALL_HINT };
  return cached;
}
