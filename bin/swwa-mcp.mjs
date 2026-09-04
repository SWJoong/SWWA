#!/usr/bin/env node
// 런처: dist가 있으면 로컬 개발 빌드, 없으면 게시본(npx). Windows에서 .mcp.json의 npx 직접
// 실행 문제를 회피한다(03 §3).
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/index.js", import.meta.url));

if (existsSync(dist)) {
  await import(dist);
} else {
  const child = spawn("npx", ["-y", "swwa-mcp"], { stdio: "inherit", shell: true });
  child.on("exit", (code) => process.exit(code ?? 1));
}
