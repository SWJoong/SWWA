import { loadKwcag22, type Kwcag22Bundle } from "./kwcag22.js";
import { loadWcag22, type Wcag22Bundle } from "./wcag22.js";
import { loadAxeMap, type AxeRuleMap } from "./axe-map.js";
import { loadCertification, type CertificationBundle } from "./certification.js";
import { loadWordlists, type Wordlists } from "./wordlists.js";
import { loadSources, type SourcesBundle } from "./sources.js";

/** 규칙 엔진(StaticContext·BrowserContext)에 주입되는 번들 데이터(03 §6). */
export interface DataBundle {
  kwcag22: Kwcag22Bundle;
  wcag22: Wcag22Bundle;
  axeRuleMap: AxeRuleMap;
  certification: CertificationBundle;
  wordlists: Wordlists;
  sources: SourcesBundle;
}

/** assets/*.json을 기동 시 1회 읽어 전부 검증한다. 하나라도 실패하면 기동을 중단한다(ADR-08). */
export function loadDataBundle(): DataBundle {
  return {
    kwcag22: loadKwcag22(),
    wcag22: loadWcag22(),
    axeRuleMap: loadAxeMap(),
    certification: loadCertification(),
    wordlists: loadWordlists(),
    sources: loadSources(),
  };
}
