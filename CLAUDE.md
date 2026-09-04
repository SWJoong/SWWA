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

### 완료
- **T-00 저장소 부트스트랩** (2026-09-04, W) — `docs/plan/00~07`, 단일 소스 `kwcag22-checklist.md`, U측 인계서 `docs/HANDOFF-U.md`, CLAUDE.md, LICENSE, .gitignore, README

### 활성
- **T-01 하네스 세팅** (U) — `docs/plan/06-harness-engineering.md` §3 절차. agent-sync 채널·SessionStart 훅·`docs/CLAUDE-INSTANCE-{U,W}.md`

### 다음
- **T-02 스캐폴드** (U) → **T-03 단일 소스 확정·데이터 계약 테스트** (W, T-01·T-02와 병행 가능) → T-04 데이터·조회 도구 (U) · 전체 WBS: `docs/plan/06-harness-engineering.md` §5
