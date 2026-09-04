// 규칙 골든 테스트 공통 헬퍼(03 §7, 04-qa-plan §1). k-규칙은 순수 함수이므로 JSDOM 컨텍스트만
// 만들어 넘기면 된다. axe·정규화는 여기서 다루지 않는다(정규화 테스트는 tests/normalize/).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { loadDataBundle } from "../../src/data/loader.js";
import type { Finding } from "../../src/report/types.js";
import type { StaticContext, StaticRule } from "../../src/rules/types.js";

const data = loadDataBundle();

export function loadFixture(ruleId: string, name: string): string {
  const url = new URL(`../fixtures/html/${ruleId}/${name}`, import.meta.url);
  return readFileSync(fileURLToPath(url), "utf8");
}

export function runRule(rule: StaticRule, html: string, baseUrl = "http://localhost/"): Finding[] {
  const dom = new JSDOM(html, { url: baseUrl, pretendToBeVisual: true });
  const ctx: StaticContext = {
    document: dom.window.document,
    window: dom.window as unknown as StaticContext["window"],
    html,
    baseUrl,
    data,
  };
  return rule.run(ctx);
}

export function selectorsOf(findings: Finding[]): string[] {
  return findings.map((f) => f.selector);
}
