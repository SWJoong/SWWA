# 04. QA 계획

> 계약: [02-architecture.md](02-architecture.md) · 규칙 목록: [kwcag22-checklist.md](../../skills/kwcag-guide/references/kwcag22-checklist.md) · 레인: W(설계·검증)

## 1. 테스트 규약

| 종류 | 위치 | 규약 |
|---|---|---|
| 규칙 골든 테스트 | `tests/rules/<rule-id>.test.ts` + `tests/fixtures/html/<rule-id>/{fail.html, pass.html, edge-*.html}` | 규칙 1개 = 테스트 파일 1개. fail 픽스처에서 정확히 기대한 요소만 검출(셀렉터 스냅샷), pass 픽스처에서 Finding 0(오탐 0). TC ID `TC-<RULE>-NN`(예: `TC-K-SKIP-LINK-FIRST-01`) |
| 브라우저 규칙 테스트 | `tests/browser/<rule-id>.test.ts` + `tests/fixtures/pages/*.html` | `scripts/serve-fixtures.mjs`로 로컬 http 서빙. `browser_status.available=false`면 `describe.skip`, CI browser job은 `SWWA_BROWSER_TESTS=1`로 skip 금지 |
| 도구 계약 테스트 | `tests/tools/*.test.ts` | `InMemoryTransport.createLinkedPair()`로 서버·클라이언트 연결, 입력 검증 오류·정상 출력 스키마(zod parse)·오류 코드 확인 |
| 데이터 테스트 | `tests/data/*.test.ts` | 33건·ID 중복 없음·별칭 1:1·모든 A/AA SC `kwcagIds` 존재·`axeRules` 실재(`axe.getRules()`)·**md 단일 소스 ↔ json 정합**(ID·명칭·WCAG·등급·규칙 ID) |
| 정규화 테스트 | `tests/normalize/*.test.ts` | axe 결과 픽스처(JSON) → Finding·33항목 status 규칙 케이스(fail/incomplete/pass/manual/na) |
| 프라이버시 | `tests/privacy/*.test.ts` | 오류 응답에 입력 본문·스택 없음, stdout에 로그 없음, 헤더 값 미노출 |
| 통합·성능 | `tests/integration/{e2e,perf}.test.ts` | 실제 자산으로 `check_html` end-to-end, 500KB HTML ≤ 2초, 기동 ≤ 1.5초 |
| 릴리스 | `tests/release/{smoke,package}.test.ts` | dist stdio 기동 → initialize → 도구 7·프롬프트 2·리소스 6 노출(EASYREAD `smoke.test.ts` 패턴) · `npm pack --dry-run` 파일 목록(dist·assets·bin 포함, tests 미포함) |

- 테스트는 **구현보다 먼저** 커밋한다(test-first). 실패 상태 커밋 메시지에 `[HANDOFF→U]`.
- 픽스처 HTML은 실제 국내 사이트 패턴을 본떠 자체 작성한다(외부 페이지 복사 금지).

## 2. 품질 게이트

| 게이트 | 명령 | 시점 |
|---|---|---|
| 로컬 | `npm run check` = lint → typecheck → build → test → validate-assets | 매 커밋 전, 세션 시작 루틴 |
| CI | `.github/workflows/ci.yml`(ubuntu, Node 22) + `cross-platform.yml`(ubuntu·windows × Node 22/24) | PR·main push |
| 브라우저 | `.github/workflows/browser.yml`: `npx playwright install --with-deps chromium` → `npm run test:browser` | PR(캐시 활용), 필수 체크 여부는 안정화 후 결정 |
| 릴리스 | `release.yml`: 게이트 재실행 → 태그·버전 일치 → publish → npx 스모크 | v태그 |

## 3. 오탐(False positive) 관리

- 휴리스틱 규칙(`confidence: low/medium`)은 `outcome: incomplete`로 보고하고 사람이 확정한다.
- 오탐 신고 이슈 템플릿(EASYREAD `.github/ISSUE_TEMPLATE/false-detection.yml` 재사용) → 재현 픽스처를 `edge-*.html`로 추가 → 규칙 수정 → 패치 릴리스.

## 4. 수동 검증 (마일스톤마다)

1. **Inspector**: `npx @modelcontextprotocol/inspector node dist/index.js` → tools/prompts/resources 목록, `check_html`에 `tests/fixtures/html/k-skip-link-first/fail.html` → `checkpoints[6.4.1].status = "fail"`.
2. **브라우저**: `audit_url`로 `http://localhost:<port>/pages/sample.html`(서빙) → b-규칙 Finding·`meta.browser.channel` 확인, 브라우저 채널을 강제로 막은 환경(`SWWA_FORCE_NO_BROWSER=1`)에서 `E_NO_BROWSER` 안내.

## 5. 플러그인 E2E 시나리오 (M4 완료 기준)

`claude --plugin-dir .` 실행 후:

| # | 입력 | 기대 |
|---|---|---|
| E2E-1 | `/swwa:a11y-review tests/fixtures/html/k-skip-link-first/fail.html` | `check_html` 호출, `6.4.1(2.4.1)` 인용, before/after 수정안, 수동 확인 목록 |
| E2E-2 | `/swwa:a11y-audit http://localhost:<port>/pages/sample.html` | `browser_status` → `audit_url` → 33항목 판정표·보고서·`estimate_cert_readiness` 준비도. 브라우저 없는 환경에서는 설치 안내 + `check_html` 대안 경로 |
| E2E-3 | "KWCAG 2.4.1이 뭐야? 인증 통과 기준은?" | `kwcag-guide` 자동 로드, `lookup_checkpoint` 호출, 인증 기준을 "확인 필요" 표기와 함께 답변 |

추가: `claude plugin validate .` 통과, `/reload-plugins` 후 `/help`에 스킬 3종 노출, `/mcp`에서 `swwa` 도구 7개 확인.

## 6. QA 산출물 일정 (W 레인)

| 태스크 | 산출물 |
|---|---|
| T-03 | `tests/data/*.test.ts`(실패 상태), 단일 소스 md 확정 |
| T-05 | T1 18규칙 픽스처·골든 테스트, `check_html`·`check_contrast` 계약 테스트, 정규화 테스트 |
| T-08 | 브라우저 픽스처 페이지·b-규칙 테스트·`serve-fixtures.mjs` 리뷰, `browser.yml` 리뷰 |
| T-11 | 스모크·패키지·e2e·perf·privacy 테스트, E2E 시나리오 수행 기록 |
