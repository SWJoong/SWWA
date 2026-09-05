#!/usr/bin/env node
// 브라우저 규칙 테스트용 로컬 정적 서버(04-qa-plan §1). tests/fixtures/pages/*.html을 서빙한다.
// 단독 실행도 가능하지만(node scripts/serve-fixtures.mjs [port]), 주 용도는
// tests/browser/browser-harness.ts가 프로그램적으로 import해 테스트 중 기동/종료하는 것이다.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const FIXTURES_ROOT = fileURLToPath(new URL("../tests/fixtures/pages", import.meta.url));

const MIME_TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };

/** @returns {Promise<{ port: number, close: () => Promise<void> }>} */
export function startFixtureServer(preferredPort = 0) {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/");
      const relative = normalize(urlPath === "/" ? "/index.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
      const filePath = join(FIXTURES_ROOT, relative);
      if (!filePath.startsWith(FIXTURES_ROOT) || !existsSync(filePath)) {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("Not found");
        return;
      }
      try {
        const body = await readFile(filePath);
        res.writeHead(200, { "content-type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(500, { "content-type": "text/plain" });
        res.end("Internal error");
      }
    });
    server.on("error", reject);
    server.listen(preferredPort, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : preferredPort;
      resolve({ port, close: () => new Promise((res) => server.close(() => res())) });
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.argv[2] ?? 0);
  const { port: actualPort } = await startFixtureServer(port);
  console.error(`[serve-fixtures] http://127.0.0.1:${actualPort}/ (${FIXTURES_ROOT})`);
}
