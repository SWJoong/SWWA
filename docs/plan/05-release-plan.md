# 05. 릴리스 계획 (DevOps)

> 레인: U · 참고: EASYREAD `release.yml`·`docs/install/*`·`SECURITY.md`

## 1. 배포 채널

| 채널 | 대상 | 방법 |
|---|---|---|
| **npm `swwa-mcp`** | 모든 MCP 클라이언트 | `npx -y swwa-mcp`. 이름 가용 확인 2026-09-04(첫 릴리스 전 재확인) |
| **Claude Code 플러그인** | Claude Code 사용자 | `/plugin marketplace add SWJoong/SWWA` → `/plugin install swwa@swwa`. `.claude-plugin/marketplace.json`의 `source: "./"` 동작을 M4에서 확인, 불가 시 `plugins/swwa/` 하위로 이동 |
| **Claude Desktop** | 데스크톱 앱 | `claude_desktop_config.json`: Windows `{"command":"cmd","args":["/c","npx","-y","swwa-mcp"]}`, mac/Linux `{"command":"npx","args":["-y","swwa-mcp"]}` |
| 개발 중 | 기여자 | `claude --plugin-dir .`(런처가 로컬 `dist/` 사용), `npm run inspector` |
| 백로그 | — | MCPB(Desktop Extension) 번들, Cursor/VS Code 설정 예시 |

플러그인 `.mcp.json`은 `node ${CLAUDE_PLUGIN_ROOT}/bin/swwa-mcp.mjs`를 호출한다(Windows에서 `npx` 직접 실행 문제 회피, 로컬 dist 우선).

## 2. 버전 전략 (semver)

| 변경 | 버전 |
|---|---|
| 검사항목 데이터·매핑 변경, 규칙 추가, 도구·리소스 추가 | minor |
| 오탐 수정, 메시지·스킬 문구 수정, 의존성 패치 | patch |
| Report 스키마 비호환 변경, 도구 삭제·이름 변경 | major |

`package.json.version` = `plugin.json.version` = git 태그 `vX.Y.Z`(불일치 시 릴리스 중단). `CHANGELOG.md` Keep a Changelog 형식.

## 3. 릴리스 파이프라인 (`release.yml`, EASYREAD 복사 후 수정)

v태그 push → `npm ci` → 게이트 재실행(lint·typecheck·build·test·validate-assets) → 태그·버전 일치 검사 → `npm publish --provenance --access public` → GitHub Release(`--generate-notes`) → 비치명 설치 스모크(`npx -y swwa-mcp@$VERSION`에 initialize JSON-RPC → `"result"` 확인, 전파 지연 재시도 최대 3분).

사전 준비(관리자, M4 전): npm Trusted Publisher(OIDC) 또는 `NPM_TOKEN` 시크릿, `main` 브랜치 보호(PR 필수, `CI`·`cross-platform` required check).

## 4. 릴리스 체크리스트 (v0.1.0)

- [ ] `npm run check` 초록, `browser.yml` 초록, `claude plugin validate .` 통과
- [ ] `tests/release/package.test.ts`: `npm pack --dry-run`에 dist·assets·bin·README·LICENSE 포함, tests·src 미포함
- [ ] `assets/sources.json` 확인일 갱신, `certification.json` `needsVerification` 상태 점검
- [ ] `docs/install/claude-code.md`·`claude-desktop.md`·`first-use.md` 최신화(도구 이름·예시)
- [ ] `CHANGELOG.md`·`plugin.json`·`package.json` 버전 일치 → 태그 push
- [ ] 게시 후: `npx -y swwa-mcp` 스모크, `/plugin install` 설치 확인, E2E 3 시나리오

## 5. 보안·프라이버시 공지 (`SECURITY.md`)

- 서버는 입력·페이지 내용을 저장·전송하지 않으며 네트워크는 `audit_url` 대상 URL에만 접근한다.
- 취약점 신고 경로(GitHub Security Advisory), 지원 버전 표.
