#!/usr/bin/env node
// 번들 데이터 자산(assets/*.json)을 zod 로더로 검증하는 CI·릴리스 게이트.
// 런타임과 동일한 로더(dist/data/*)를 재사용한다 — 스키마 정의를 한 곳(src/data)에만 둔다.
// T-02(현재)는 src/data/* 로더가 아직 없다(T-04에서 추가). 그때까지는 통과시키는 스텁이다.
// TODO(T-04): loadKwcag22()·loadWcag22()·loadAxeMap()·loadCertification()·loadWordlists()로 교체.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dataDir = fileURLToPath(new URL("../dist/data", import.meta.url));

if (!existsSync(dataDir)) {
  console.error("[validate-assets] 스텁 통과 — dist/data 로더 없음(T-04 예정)");
  process.exit(0);
}

try {
  const { loadKwcag22 } = await import("../dist/data/kwcag22.js");
  const kwcag22 = loadKwcag22();
  console.error(`[validate-assets] OK — 검사항목 ${kwcag22.checkpoints.length}건`);
} catch (err) {
  console.error(`[validate-assets] 실패: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
