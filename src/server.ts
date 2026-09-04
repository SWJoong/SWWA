import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { normalizeToolSchemaDialect } from "./schema-dialect.js";

/**
 * SWWA MCP 서버를 조립한다. 도구·프롬프트·리소스 등록만 담당하고 로직은 갖지 않는다(03 §1).
 * T-02(현재)는 빈 등록 상태다. 도구 7·프롬프트 2·리소스 6은 T-04~T-09에서 순차 등록한다
 * (계약: docs/plan/02-architecture.md §3).
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: "swwa", version: "0.1.0" });
  // SDK가 도구 스키마를 draft-07로 방출 → 최신 클라이언트(2020-12) 호환되게 정규화.
  // 반드시 도구 등록 전에 호출한다(tools/list 핸들러 설치 시점을 가로채기 위함).
  normalizeToolSchemaDialect(server);

  // TODO(T-04~T-09): registerTool(check_html·check_contrast·lookup_checkpoint·get_checklist·
  // audit_url·browser_status·estimate_cert_readiness), registerPrompt(review-markup·audit-report),
  // registerResource(swwa://kwcag22 등 6종).

  return server;
}
