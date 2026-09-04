#!/usr/bin/env node
/**
 * SWWA MCP 서버 엔트리. stdio 트랜스포트로 기동한다.
 * 계약: docs/plan/02-architecture.md §3 · 구현 방침: docs/plan/03-backend-plan.md
 *
 * 로깅 규약: stdout은 JSON-RPC 채널이므로 절대 쓰지 않는다. 로그는 stderr(console.error)만,
 * 그리고 입력·페이지 내용은 저장·전송하지 않는다(NFR-01·03).
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const detail = error instanceof Error ? error.message : "";
  console.error(`[swwa] 서버를 시작하지 못했습니다. ${detail}`);
  process.exit(1);
});
