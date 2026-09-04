# U측 인계서 — T-01(하네스)부터 시작하기

> 작성: W(계획 세션, 2026-09-04). U측 Claude Code 세션(Ubuntu/팀 계정, Opus 4.8 최대)에 아래 「시작 프롬프트」를 그대로 붙여 넣으면 된다. 계획 전체는 `docs/plan/`, 검사항목 단일 소스는 `skills/kwcag-guide/references/kwcag22-checklist.md`.

## 1. 시작 프롬프트 (복붙용)

```text
SWJoong/SWWA 저장소의 Instance-U(구현·배포 축, Backend·DevOps)로 작업을 시작한다. 구현 모델은 Opus 4.8(최대)이며 한 번에 한 태스크만 진행한다.

1. `git clone https://github.com/SWJoong/SWWA.git && cd SWWA` 후 다음 순서로 읽는다: CLAUDE.md → docs/HANDOFF-U.md → docs/plan/00-overview.md → docs/plan/06-harness-engineering.md → docs/plan/02-architecture.md → docs/plan/03-backend-plan.md → skills/kwcag-guide/references/kwcag22-checklist.md.
2. T-01 하네스 세팅: docs/plan/06-harness-engineering.md §3 절차대로 수행한다(EASYREAD의 scripts/agent-sync.sh 드롭인, agent-sync orphan 브랜치, .claude/settings.json SessionStart 훅, docs/CLAUDE-INSTANCE-U.md·W.md 작성). 완료 후 `scripts/agent-sync.sh post u "T-01 완료 · T-02 착수"`를 남긴다.
3. T-02 스캐폴드: docs/plan/03-backend-plan.md §1~§3 구조로 package.json(swwa-mcp)·tsconfig·eslint·vitest·src/index.ts·server.ts·schema-dialect.ts(EASYREAD 복사)·bin/swwa-mcp.mjs·.claude-plugin/plugin.json·.mcp.json·skills/ 3개 골격·CI 워크플로를 만든다. 완료 기준: `npm run check` 통과, `npm run inspector`에서 initialize 확인, `claude plugin validate .` 통과. feat 브랜치 → PR → CI 초록 → merge.
4. 레인 규칙(CLAUDE.md)을 지킨다: tests/ · skills/kwcag-guide/ · docs/plan/{01,02,04}.md는 W 레인이므로 수정하지 않고 `[HANDOFF→W]` 커밋 접두나 agent-sync post로 요청한다. main 직접 push 금지.
5. 판단이 필요한 계약 변경(도구 입력·출력 스키마, 검사항목 등급)은 구현하지 말고 docs/plan/02-architecture.md 변경을 W에 요청한다. 커밋 접두 `T-XX:`.
6. 이후 순서: T-04(데이터 자산·조회 도구, W의 T-03 테스트를 pull 후) → T-06(정적 엔진·T1 규칙 18개) → T-07(브라우저 엔진·b-규칙) → T-09 → T-10(a11y-review·a11y-audit 스킬) → T-12(배포).
```

## 2. 읽기 순서와 이유

| 순서 | 문서 | 왜 |
|---|---|---|
| 1 | `CLAUDE.md` | 원칙·컨벤션·레인·세션 루틴·현재 현황(매 세션 자동 로드) |
| 2 | `docs/HANDOFF-U.md` | 이 문서 — 시작 절차와 체크리스트 |
| 3 | `docs/plan/00-overview.md` | 목표·확정 결정·기술 스택·로드맵 |
| 4 | `docs/plan/06-harness-engineering.md` | T-01 설치 절차, WBS 레인 배정 |
| 5 | `docs/plan/02-architecture.md` | **계약**: 도구 7·프롬프트 2·리소스 6, Report/Finding 스키마, 데이터 모델 |
| 6 | `docs/plan/03-backend-plan.md` | 저장소 구조, 의존성 버전, 엔진·규칙·정규화 구현 방침 |
| 7 | `skills/kwcag-guide/references/kwcag22-checklist.md` | 33항목 × 규칙 ID × 등급 단일 소스(데이터·규칙 구현의 원본) |
| 참고 | `docs/plan/07-references.md` | 레퍼런스 출처·라이선스 메모(데이터화 시 `assets/sources.json`으로) |

## 3. T-01 체크리스트 (하네스)

- [ ] `scripts/agent-sync.sh` 드롭인(EASYREAD 체크아웃 또는 raw URL), `ROLES="w u"` 확인, 실행 권한
- [ ] `agent-sync` orphan 브랜치 생성·푸시(06 §3 명령)
- [ ] `.claude/settings.json` SessionStart 훅
- [ ] `docs/CLAUDE-INSTANCE-U.md`·`docs/CLAUDE-INSTANCE-W.md` — EASYREAD 동명 파일을 복사해 레인(CLAUDE.md 「레인 규칙」)과 스킬 이름을 SWWA 값으로 치환
- [ ] 커밋 `T-01: 하네스 세팅` → 푸시 → `scripts/agent-sync.sh post u "…"`
- [ ] (관리자에게 요청) `main` 브랜치 보호: PR 필수, `CI` required check

## 4. T-02 체크리스트 (스캐폴드)

- [ ] `package.json` — `docs/plan/03-backend-plan.md` §2 그대로(이름 `swwa-mcp`, TS ~6.0, SDK ^1.30, zod ^4, axe-core ~4.13, @axe-core/playwright ~4.13, jsdom ^30, playwright-core ^1.62, parse5 ^8; dev: playwright, vitest, eslint 10, typescript-eslint, tsx, @types/*)
- [ ] EASYREAD에서 복사·개명: `src/schema-dialect.ts`, `src/index.ts`·`src/server.ts` 뼈대, `tsconfig.json`·`tsconfig.build.json`, `eslint.config.js`, `scripts/validate-assets.mjs`(로더 교체), `.github/workflows/{ci,cross-platform}.yml`, `.github/ISSUE_TEMPLATE/*`, `.github/PULL_REQUEST_TEMPLATE.md`, `SECURITY.md`
- [ ] `bin/swwa-mcp.mjs` 런처(03 §3), `.mcp.json`(`node ${CLAUDE_PLUGIN_ROOT}/bin/swwa-mcp.mjs`), `.claude-plugin/plugin.json`(name `swwa`, version `0.1.0`), `.claude-plugin/marketplace.json`(source `./`)
- [ ] `skills/a11y-review/SKILL.md`·`skills/a11y-audit/SKILL.md` 골격(프런트매터 + "구현 중" 본문). `skills/kwcag-guide/SKILL.md`는 W 레인이므로 생성하지 않는다(W가 T-03에서 작성)
- [ ] `src/server.ts`에 `normalizeToolSchemaDialect` 호출 후 빈 등록 → `npm run inspector`에서 initialize 응답 확인
- [ ] `npm run check` 통과(테스트 0건이면 vitest `passWithNoTests`), `claude plugin validate .` 통과
- [ ] `CLAUDE.md` 「현재 작업 현황」 갱신(완료 T-01·T-02, 활성 T-04 대기), PR → merge → `agent-sync post`

## 5. W가 병행하는 일 (참고 — U는 손대지 않음)

- T-03: `kwcag22-checklist.md` 확정, `skills/kwcag-guide/references/{wcag-mapping.md, sources.md}`, `tests/data/*.test.ts`(실패 상태 커밋, `[HANDOFF→U]`)
- T-05: T1 규칙 18개 픽스처·골든 테스트, `check_html`·`check_contrast` 계약 테스트

U는 T-04 착수 전 `git pull`로 T-03 테스트를 받아 초록으로 만드는 것을 완료 기준으로 삼는다.

## 6. 막히면

- 계약(스키마·등급) 변경이 필요하면 구현하지 말고 agent-sync post + `[HANDOFF→W]`로 요청.
- 외부 출처 확인이 필요한 수치(인증 기준 등)는 `needsVerification: true`로 두고 진행.
- 브라우저(Chrome/Edge) 없는 환경이면 `npx playwright install chromium` 후 진행하되, 정적 경로(T-04·T-06)는 브라우저 없이 완료 가능.
