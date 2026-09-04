import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { normalizeToolSchemaDialect } from "./schema-dialect.js";
import type { DataBundle } from "./data/loader.js";
import { registerLookupTool } from "./tools/lookup.js";
import { registerChecklistTool } from "./tools/checklist.js";
import { registerResources } from "./resources/index.js";

/**
 * SWWA MCP 서버를 조립한다. 도구·프롬프트·리소스 등록만 담당하고 로직은 갖지 않는다(03 §1).
 * T-04(현재)는 데이터 조회 도구 2개·리소스 6종만 등록한다. 나머지 5개 도구(check_html 등)와
 * 프롬프트 2종은 T-06~T-09에서 순차 등록한다(계약: docs/plan/02-architecture.md §3).
 */
export function createServer(data: DataBundle): McpServer {
  const server = new McpServer({ name: "swwa", version: "0.1.0" });
  // SDK가 도구 스키마를 draft-07로 방출 → 최신 클라이언트(2020-12) 호환되게 정규화.
  // 반드시 도구 등록 전에 호출한다(tools/list 핸들러 설치 시점을 가로채기 위함).
  normalizeToolSchemaDialect(server);

  registerLookupTool(server, data);
  registerChecklistTool(server, data);
  registerResources(server, data);

  // TODO(T-06~T-09): registerTool(check_html·check_contrast·audit_url·browser_status·
  // estimate_cert_readiness), registerPrompt(review-markup·audit-report).

  return server;
}
