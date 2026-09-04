# 06. 하네스 엔지니어링 운영 계획서

> 두 개의 Claude Code 인스턴스(W·U)를 병렬 운영해 SWWA v0.1.0을 완성한다. **하네스 세팅(T-01)은 U측 세션에서 수행한다**(U측 계정 한도 상향). 원리·안티패턴은 `parallel-agent-harness` 스킬(`references/operating-model.md`)과 EASYREAD `docs/plan/06-harness-engineering.md` 참조.

## 1. 인스턴스 구성

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│  Instance-W (Windows)       │     │  Instance-U (Ubuntu)        │
│  개인 Claude 계정            │     │  팀 Claude 계정(한도 상향)    │
│  역할: PL / QA              │     │  역할: Backend / DevOps      │
│  "설계 → 검증" 축            │     │  "구현 → 배포" 축             │
└──────────────┬──────────────┘     └──────────────┬──────────────┘
               └───────── GitHub (main) ───────────┘
                     SWJoong/SWWA  (+ agent-sync 채널 브랜치)
```

## 2. 4가지 결정 (SWWA 값)

| 결정 | SWWA 값 |
|---|---|
| ① 축·역할 | **W** = 설계·검증(PL·QA): 명세·단일 소스·테스트·리뷰 · **U** = 구현·배포(Backend·DevOps): 스캐폴드·데이터·엔진·규칙·도구·스킬 본문·CI·릴리스 |
| ② 레인 | **W**: `tests/` · `skills/kwcag-guide/` · `docs/plan/{01,02,04}.md` · **U**: `src/` · `assets/` · `bin/` · `scripts/` · `skills/a11y-review/` · `skills/a11y-audit/` · `.claude-plugin/` · `.mcp.json` · `.github/` · `package.json`·설정 파일 · `docs/plan/{00,03,05,06,07}.md` · `docs/install/` · `README.md` · `CLAUDE.md` · **공유**: `CLAUDE.md` 「현재 작업 현황」(U 담당·W 리뷰), `skills/kwcag-guide/references/kwcag22-checklist.md`(W 담당·U는 PR로 제안) |
| ③ 채널 | `scripts/agent-sync.sh`(EASYREAD 스크립트 드롭인, `ROLES="w u"`) + `agent-sync` orphan 브랜치(상태 로그만) + `.claude/settings.json` SessionStart 훅 `bash scripts/agent-sync.sh pull` |
| ④ 게이트·핸드오프 | 게이트 `npm run check`(lint·typecheck·build·test·validate-assets) 필수, `npm run test:browser`는 U 로컬·CI browser job · 커밋 접두 `T-XX: …` · 인계 `[HANDOFF→W]`·`[HANDOFF→U]`·`[SYNC]` · main 직접 push 금지(PR+CI; 브랜치 보호는 관리자) · **test-first**: W가 실패 테스트를 먼저 커밋 → U가 초록으로 |

레인이 겹치면 코드 구조 신호다 — 모듈 경계를 다시 긋는다. 공유 파일은 담당이 수정하고 상대는 리뷰만.

## 3. U측 설치 절차 (T-01)

```bash
git clone https://github.com/SWJoong/SWWA.git && cd SWWA
# 1) 채널 스크립트 — EASYREAD 드롭인(상단 ROLES="w u"·EMAIL만 확인)
mkdir -p scripts
cp <EASYREAD 체크아웃>/scripts/agent-sync.sh scripts/     # 또는: curl -fsSL https://raw.githubusercontent.com/SWJoong/EASYREAD/main/scripts/agent-sync.sh -o scripts/agent-sync.sh
chmod +x scripts/agent-sync.sh
# 2) 채널 부트스트랩(최초 1회)
git switch --orphan agent-sync && git commit --allow-empty -m "agent-sync: 채널 개설" && git push -u origin agent-sync && git switch -
# 3) 인스턴스 지시서 — EASYREAD docs/CLAUDE-INSTANCE-{U,W}.md를 복사해 레인(§2)·스킬 이름을 SWWA 값으로 치환
#    U: ~/.claude/CLAUDE.md에 docs/CLAUDE-INSTANCE-U.md 내용 반영 / W: docs/CLAUDE-INSTANCE-W.md
# 4) SessionStart 훅
cat > .claude/settings.json <<'EOF'
{ "hooks": { "SessionStart": [ { "hooks": [ { "type": "command", "command": "bash scripts/agent-sync.sh pull 2>/dev/null || true" } ] } ] } }
EOF
# 5) 커밋·푸시 후 채널 검증
git add -A && git commit -m "T-01: 하네스 세팅(agent-sync 채널·훅·인스턴스 지시서)" && git push
scripts/agent-sync.sh post u "T-01 하네스 개설 완료 · 다음 T-02 스캐폴드 착수"
# W측: scripts/agent-sync.sh pull 로 위 메시지가 보이면 완료
```

CLAUDE.md의 하네스 블록(공용 규칙)은 T-00에서 이미 삽입되어 있다. T-01에서는 `docs/CLAUDE-INSTANCE-U.md`·`W.md`(역할별 담당·금지·작업 패턴)만 추가한다.

## 4. 매 세션 루틴 (토큰 절약)

1. `scripts/agent-sync.sh pull` — 상대 최신 상태 로드(훅 자동). 이전 결과 복붙·재설명 금지.
2. `CLAUDE.md` 「현재 작업 현황」 + 채널 로그로 **내 다음 작업만** 파악.
3. `npm run check` — 전체 재검토 대신 게이트만 확인.
4. **내 레인만** 착수(상대 레인 파일은 열지 않는다). 턴 종료 시 `scripts/agent-sync.sh post <w|u> "진행·문제·다음"`.

상태 이원화: **코드 = PR·CI · 대화 = agent-sync 채널 · 상황 = 커밋 메시지 접두.**

## 5. WBS · 레인 배정

| 태스크 | 레인 | 산출물 | 완료 기준 |
|---|---|---|---|
| **T-00** 저장소 부트스트랩 | W(계획 세션, 완료 2026-09-04) | `docs/plan/00~07`, 단일 소스 `kwcag22-checklist.md`, `CLAUDE.md`, `LICENSE`, `.gitignore`, `README.md` → `origin main` | U가 clone하면 계획·단일 소스를 읽을 수 있음 |
| **T-01** 하네스 세팅 | U | §3 | 양방향 post/pull 확인 |
| **T-02** 스캐폴드 | U | `package.json`·tsconfig·eslint·vitest·`src/index.ts`·`server.ts`·`schema-dialect.ts`(EASYREAD 복사·개명)·`bin/swwa-mcp.mjs`·`.claude-plugin/`·`.mcp.json`·`skills/` 3개 골격·`ci.yml`·`cross-platform.yml` | `npm run check` 통과, Inspector initialize 확인, `claude plugin validate .` 통과 |
| **T-03** 단일 소스·데이터 계약 테스트 | W | `kwcag22-checklist.md` 확정, `wcag-mapping.md`, `sources.md`, `tests/data/*.test.ts`(실패 상태 커밋) | `[HANDOFF→U]` |
| **T-04** 데이터 자산·조회 도구 | U | `assets/*.json`, `src/data/*`, `validate-assets.mjs`, 리소스 6종, `lookup_checkpoint`·`get_checklist` | T-03 초록 · **M1** |
| **T-05** 정적 규칙 골든 테스트 | W | T1 18규칙 픽스처 fail/pass + `tests/rules/k-*.test.ts`, `check_html`·`check_contrast` 계약 테스트, 정규화 테스트 | `[HANDOFF→U]` |
| **T-06** 정적 엔진 | U | `engine/static.ts`, `rules/k/*`(T1 18개), `normalize/*`, `report/*`, `color/contrast.ts`, `check_html`·`check_contrast` | T-05 초록, 500KB ≤ 2초 · **M2** |
| **T-07** 브라우저 엔진 | U | `browser-detect.ts`, `engine/browser.ts`, `rules/b/*` 6개, `url-guard.ts`, `audit_url`·`browser_status`, `browser.yml` | 로컬 Chrome으로 `audit_url` 동작, 없을 때 `E_NO_BROWSER` |
| **T-08** 브라우저 테스트 | W | `tests/fixtures/pages/*`, `scripts/serve-fixtures.mjs` 리뷰, `tests/browser/b-*.test.ts` | CI browser job 초록 |
| **T-09** 인증 준비도·프롬프트·T2 규칙 | U | `estimate_cert_readiness`, `report/cert.ts`, 프롬프트 2종, T2 규칙(가능한 만큼) | W 계약 테스트 초록 · **M3** |
| **T-10** 스킬 본문 | U(a11y-review·a11y-audit) / W(kwcag-guide + certification·mobile-app-guideline·glossary) | SKILL.md 3종 + references | E2E 3 시나리오 통과 |
| **T-11** 통합·릴리스 테스트 | W | smoke·package·e2e·perf·privacy 테스트 | 전부 초록 |
| **T-12** 배포 | U | `release.yml`, `docs/install/*`, README, CHANGELOG, `marketplace.json`, v0.1.0 | npm 게시·npx 스모크·플러그인 설치 확인 · **M4** |

병렬화 팁: W의 T-03은 U의 T-01·T-02와 동시에 진행할 수 있다(레인이 겹치지 않음). U는 T-04 착수 전 T-03 테스트를 pull한다.

## 6. 충돌 해결 우선순위

1. 충돌이 W 레인 파일이면 W 버전 · U 레인이면 U 버전 · 공유 파일이면 담당 버전.
2. 판단 불가 → 사용자가 수동 해결.

## 7. 안티패턴

- 상대 레인 파일을 "잠깐" 고치기 → 반드시 `[HANDOFF]` 요청으로.
- 채널에 코드 붙여넣기 → 코드는 PR·CI만.
- 게이트를 건너뛴 핸드오프 → `npm run check` 실패 상태로 인계 금지(테스트 선작성은 예외: 의도된 실패를 커밋 메시지에 명시).
