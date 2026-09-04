import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

// axe-core는 @axe-core/playwright에서 axe.configure({locale})를 노출하지 않아, 엔진(jsdom·브라우저)에
// 무관하게 정규화 단계에서 한 번만 한국어 메시지를 적용한다(ADR-07).
interface LocaleEntry {
  help?: string;
  description?: string;
}

interface AxeLocale {
  rules?: Record<string, LocaleEntry>;
}

let cached: AxeLocale | undefined;

function loadKoLocale(): AxeLocale {
  if (cached) return cached;
  const require = createRequire(import.meta.url);
  const path = require.resolve("axe-core/locales/ko.json");
  cached = JSON.parse(readFileSync(path, "utf8")) as AxeLocale;
  return cached;
}

/** axe 규칙의 help·description을 ko.json으로 치환한다. 로케일에 없는 규칙은 영어 원문 유지(ADR-07). */
export function localizeAxeMessage(ruleId: string, help: string, description: string): { help: string; description: string } {
  const entry = loadKoLocale().rules?.[ruleId];
  return {
    help: entry?.help ?? help,
    description: entry?.description ?? description,
  };
}
