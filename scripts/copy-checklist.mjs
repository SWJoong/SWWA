#!/usr/bin/env node
// swwa://kwcag22 리소스가 npx 배포본(assets/만 포함, skills/는 미포함)에서도 동작하도록
// 단일 소스(skills/kwcag-guide/references/kwcag22-checklist.md, W 소유)를 build 시점에
// assets/로 복사한다. 손으로 유지하지 않는다 — 항상 이 스크립트가 새로 생성한다.
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(
  new URL("../skills/kwcag-guide/references/kwcag22-checklist.md", import.meta.url),
);
const dest = fileURLToPath(new URL("../assets/kwcag22-checklist.md", import.meta.url));

copyFileSync(src, dest);
console.error("[copy-checklist] assets/kwcag22-checklist.md 갱신됨");
