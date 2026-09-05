# SWWA — 프로젝트 컨텍스트

## 프로젝트 개요
KWCAG 2.2(한국형 웹 콘텐츠 접근성 지침, 33개 검사항목)·웹 접근성 품질인증 기준으로 웹 접근성을 검사·리뷰·인증 준비하도록 돕는 **Claude Code 플러그인(스킬 3종) + MCP 서버(npm `swwa-mcp`)**. TypeScript + Node.js 22. 계획: `docs/plan/00-overview.md`.

## 핵심 명령어 (T-02 스캐폴드 후 유효)
```bash
npm run build         # tsc 빌드
npm test              # vitest (브라우저 테스트 제외)
npm run test:browser  # Playwright 브라우저 규칙 테스트
npm run typecheck     # 타입 검사
npm run lint          # eslint
npm run check         # lint + typecheck + build + test + validate-assets (게이트)
npm run inspector     # MCP Inspector
claude --plugin-dir . # 플러그인 로컬 테스트
```

## 아키텍처 원칙
- 판정·측정·지식은 서버(결정적·오프라인), 해석·수정안·보고서는 클라이언트 LLM
- 하이브리드 엔진: `static`(jsdom + axe-core ko + `k-` 규칙) 기본, `browser`(playwright-core + @axe-core/playwright + `b-` 규칙) 선택. 브라우저 없어도 정적·지식 도구는 동작
- **검사항목 단일 소스**: `skills/kwcag-guide/references/kwcag22-checklist.md` → `assets/kwcag22.json` → 데이터 테스트가 정합 검증
- 규칙 1개 = 파일 1개 = 픽스처 fail/pass 1쌍 = 골든 테스트 1개 (순수 함수)
- 모든 Report는 33개 검사항목 상태표를 항상 포함하고 자동 검사 한계를 고지한다
- stdout은 JSON-RPC 채널 — 로깅은 `console.error`만. 입력·페이지 내용은 저장·전송하지 않는다
- 표준·제작기법 원문 전재 금지(명칭·요구 문장 한 줄 인용 + 자체 요약 + 출처)

## 코딩 컨벤션
- ESM 전용, 파일명 kebab-case, 규칙 파일 = 규칙 ID(`k-skip-link-first.ts`)
- 사용자 대면 문자열은 `src/messages.ts`에 집중, 한국어
- 검사항목 인용은 `6.4.1(2.4.1)` 공식 번호(별칭) 병기
- 테스트 이름에 TC ID 포함(예: `TC-K-SKIP-LINK-FIRST-01`)
- 커밋 메시지: `T-XX: 내용` · 인계 접두 `[HANDOFF→W]`·`[HANDOFF→U]`·`[SYNC]`

## 병렬 하네스 운영 중
이 프로젝트는 2개의 Claude Code 인스턴스가 병렬로 작업한다. 상세: `docs/plan/06-harness-engineering.md`.
- **W** (Windows/개인 계정): 설계·검증 축 — PL·QA
- **U** (Ubuntu/팀 계정, 한도 상향): 구현·배포 축 — Backend·DevOps

### 레인 규칙 (충돌 방지의 핵심)
- `tests/` · `skills/kwcag-guide/` · `docs/plan/{01,02,04}.md` 수정 → **W만**
- `src/` · `assets/` · `bin/` · `scripts/` · `skills/a11y-review/` · `skills/a11y-audit/` · `.claude-plugin/` · `.mcp.json` · `.github/` · `package.json`·설정 · `docs/plan/{00,03,05,06,07}.md` · `docs/install/` · `README.md` 수정 → **U만**
- 공유: `CLAUDE.md` 「현재 작업 현황」은 U가 담당·W는 리뷰, `kwcag22-checklist.md`는 W가 담당·U는 PR로 제안
- main 직접 push 금지 — 코드는 **항상 PR·CI 경유**

### 상태 동기화 (복붙 없이 — agent-sync 채널)
- 세션 시작·재개 시: `scripts/agent-sync.sh pull` 로 상대 최신 상태를 읽는다(SessionStart 훅이 자동 수행, T-01에서 설치).
- 핸드오프·턴 종료 시: `scripts/agent-sync.sh post <w|u> "진행상황·문제·다음 요청"` 로 내 상태를 남긴다.
- 전용 `agent-sync` 브랜치에 **상태 로그만** 담는다(코드 아님). 코드 핸드오프는 PR·CI 경유.

### 매 세션 루틴 (토큰 절약)
1. `scripts/agent-sync.sh pull` — 상대 최신 상태 로드. 이전 결과 복붙·재설명 금지.
2. 아래 「현재 작업 현황」 + agent-sync 로그로 **내 다음 작업만** 파악.
3. `npm run check` — 전체 재검토 대신 게이트만 확인.
4. **내 레인만** 착수. 턴 종료 시 `scripts/agent-sync.sh post`로 상태만 남긴다.
> 상태 이원화: 코드는 PR·CI, 대화는 agent-sync(복붙 0), 상황은 커밋 메시지 접두로.

### 충돌 해결 우선순위
1. W 레인 파일 → W 버전 · 2. U 레인 파일 → U 버전 · 3. 공유 파일 → 담당 버전 · 4. 판단 불가 → 사용자 수동 해결

## 현재 작업 현황

> **비고(2026-09-04)**: W측 세션이 당분간 작업 불가하여 U가 T-03부터 W 역할(체크리스트 확정·
> 테스트 작성)까지 겸해서 진행 중이다. 레인 표시·test-first 원칙은 계속 지키되 핸드오프 대기 없이
> 순서대로 이어서 처리한다.

### 완료
- **T-00 저장소 부트스트랩** (2026-09-04, W) — `docs/plan/00~07`, 단일 소스 `kwcag22-checklist.md`, U측 인계서 `docs/HANDOFF-U.md`, CLAUDE.md, LICENSE, .gitignore, README
- **T-01 하네스 세팅** (2026-09-04, U) — `scripts/agent-sync.sh`·`agent-sync` 채널 브랜치·`.claude/settings.json` SessionStart 훅·`docs/CLAUDE-INSTANCE-{U,W}.md`. PR #1, main 병합 완료
- **T-02 스캐폴드** (2026-09-04, U) — `package.json`(swwa-mcp)·tsconfig·eslint·vitest·`src/{index,server,messages,schema-dialect}.ts`·`bin/swwa-mcp.mjs`·`.claude-plugin/{plugin,marketplace}.json`·`.mcp.json`·`skills/{a11y-review,a11y-audit}/SKILL.md` 골격·`.github/workflows/{ci,cross-platform}.yml`·이슈·PR 템플릿·`SECURITY.md`. PR #2, main 병합 완료
- **T-03 단일 소스 확정·데이터 계약 테스트** (2026-09-04, U가 W 역할 겸임) — `kwcag-guide/SKILL.md`·`wcag-mapping.md`·`sources.md` 신규, `tests/data/{checklist-source.ts,kwcag22-source.test.ts,kwcag22.test.ts}` 작성. PR #3
- **T-04 데이터 자산·조회 도구** (2026-09-04, U) — `assets/*.json`(kwcag22·wcag22·axe-rule-map·certification·link-text-ko·alt-text-ko·sources)·`assets/mobile-app-2.0.md`·`src/data/*` 로더 6종·`scripts/copy-checklist.mjs`·`lookup_checkpoint`·`get_checklist`·리소스 6종. `npm run check` 통과(T-03 데이터 계약 테스트 16건 전부 초록), Inspector로 도구·리소스 동작 확인. PR #4(T-03 PR #3에 스택)
- **T-05 정적 규칙 골든 테스트** (2026-09-05, U가 W 역할 겸임) — T1 18규칙 픽스처·골든 테스트, `check_html`·`check_contrast` 계약 테스트, 정규화 테스트(의도된 실패로 커밋)
- **T-06 정적 엔진** (2026-09-05, U) — `engine/static.ts`(jsdom+axe-core+k-규칙)·`rules/k/*`(T1 18개)·`normalize/{finding,axe,checkpoints,locale}.ts`·`report/{types,summarize,format}.ts`·`color/contrast.ts`·`check_html`·`check_contrast`. T-05 테스트 전부 초록(92개 전체 테스트 통과). **알려진 한계**: axe-core+jsdom 성능 특성상 "500KB ≤ 2초" 완료 기준 미충족(일반 컴포넌트/페이지 검사는 ~0.2초로 빠름, 대용량 조밀 페이지는 수십 초) — 상세는 `docs/plan/03-backend-plan.md` §5.1, 후속 조치는 백로그
- **T-07 브라우저 엔진 + T-08 브라우저 테스트** (2026-09-05, U가 W 역할 겸임) — `engine/{browser,browser-detect,url-guard}.ts`·`rules/b/*` 6개·`audit_url`·`browser_status`, `tests/browser/*`(b-규칙 6종·audit_url·browser_status 계약, 17건)·`tests/fixtures/pages/*`·`scripts/serve-fixtures.mjs`·`.github/workflows/browser.yml`. 이번엔 테스트를 먼저 committed-red로 커밋하지 않고 테스트·구현을 함께 작성해 실제 로컬 Chrome으로 검증 후 한 커밋으로 올렸다(시간 제약, PR에 명시). 완료 기준 충족: 로컬 Chrome으로 `audit_url` 동작 확인(Inspector 수동 호출 포함)
- **성능 백로그(정적 엔진 하드 타임아웃)** (2026-09-05, U) — `engine/static-worker.ts` 신설, `runStatic`을 worker_threads로 분리해 `worker.terminate()`로 강제 종료 가능한 하드 타임아웃 구현(axe 동기 점유로 행 걸리던 문제 해결). `tests/engine/static-worker.test.ts`, `vitest.config.ts` testTimeout 30초. 상세 `docs/plan/03-backend-plan.md` §5.1. PR #9
- **T-09 인증 준비도·프롬프트** (2026-09-05, U) — `report/cert.ts`·`estimate_cert_readiness`·프롬프트 2종(`review-markup`·`audit-report`)·`skills/a11y-audit/references/report-template.md`. 도구 7개·프롬프트 2종·리소스 6종 전부 등록 완료. `npm run check` 통과(114건), Inspector로 도구·프롬프트 동작 확인. **M3 완성**. T2 규칙(가능한 만큼)은 후속 PR로 분리
- **T-10 스킬 본문** (2026-09-05, U가 W 몫 kwcag-guide references도 겸함) — `a11y-review` SKILL.md 본문 + references 9종(html·react-jsx·vue-svelte·css·forms·tables·media·aria-widgets·korean-pitfalls), `a11y-audit` SKILL.md 본문 + references(audit-flow·page-sampling·user-eval-checklist, report-template은 T-09), `kwcag-guide` references(certification·mobile-app-guideline·glossary) + SKILL.md 링크 갱신. `claude plugin validate .`·`skills --strict` 통과, `npm run check`(114건) 통과. E2E 3 시나리오는 `claude --plugin-dir .` 대화형이라 자동 실행 불가 — 플러그인 검증·Inspector 동작으로 대체 확인

- **T-11 통합·릴리스 테스트** (2026-09-05, U가 W 레인 겸함) — `tests/release/{smoke,package}.ts`(dist stdio 기동·initialize·도구7/프롬프트2/리소스6 노출·check_html e2e·npm pack 내용), `tests/privacy/nfr-03.ts`(입력 본문 무로깅·오류 응답 무스택), `tests/integration/{perf,e2e}.ts`(기동 예산·일반 페이지 검사 속도·도구 조합 E2E). `docs/release/e2e-manual.md`(대화형 슬래시 커맨드 E2E 수동 절차·기록표). `npm run check`(139건)·`test:browser`(17건) 통과

- **T-12 배포 준비(게시 직전까지)** (2026-09-05, U) — `.github/workflows/release.yml`(v태그 push → 게이트 재실행 → 태그·package.json·plugin.json 버전 일치 검사 → npm publish --provenance → GitHub Release → 설치 스모크), `CHANGELOG.md`(v0.1.0), `docs/install/{claude-code,claude-desktop,first-use}.md`, README v0.1.0 갱신. `npm run check`(139건)·`claude plugin validate .` 통과, 버전 3곳(package·plugin·CHANGELOG) 0.1.0 일치

### 활성 / 남은 일 (관리자·후속)
- **실제 배포(관리자 필요)** — ① `main` 브랜치 보호(PR 필수, `check`·`cross-platform` required) ② npm 게시 권한: npm Trusted Publisher(OIDC) 또는 `NPM_TOKEN` 시크릿 ③ 준비되면 `v0.1.0` 태그 push → release.yml 자동 게시 ④ 게시 후 `docs/release/e2e-manual.md`의 대화형 E2E 3종 수행·기록
- **T2 규칙** (2026-09-05, U) — 단일 소스 §5의 T2 13개 전부 구현: k-sensory-instruction·k-outline-none·k-accesskey·k-session-timeout-hint·k-carousel-no-pause·k-flash-animation·k-link-same-text-diff-href·k-gesture-listener·k-down-event-action·k-device-motion·k-onload-popup·k-error-association·k-autocomplete-missing. 전부 휴리스틱이라 outcome incomplete(사람 확인). `registry.ts`에 T2RULES·ALL_K_RULES 추가, 정적 엔진이 T1+T2(31개) 실행. 픽스처 26·골든 테스트 26·registry 정합성 테스트. `npm run check`(168건)·`test:browser`(17건) 통과. CSS 규칙(outline-none·flash-animation)은 jsdom CSSOM 사용
- **성능 백로그** — warm worker pool 재사용(호출당 지연 ~800ms→axe 시간). `docs/plan/03-backend-plan.md` §5.1

전체 WBS: `docs/plan/06-harness-engineering.md` §5 — **M4까지 구현·검증 완료, 게시만 관리자 대기**
