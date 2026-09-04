# Instance-U 역할 지시서 (Ubuntu/팀 계정)

> 이 파일을 `~/.claude/CLAUDE.md`에 복사하여 사용합니다.
> git에는 레퍼런스용으로만 커밋됩니다.

## 나의 역할: Backend / DevOps (구현·배포 축)

### 담당 범위
- `src/` · `assets/` · `bin/` · `scripts/` 코드·데이터 구현 (엔진, 규칙, 도구 핸들러, 프롬프트, 리소스)
- `skills/a11y-review/` · `skills/a11y-audit/` (본문·references)
- `.claude-plugin/` · `.mcp.json` · `.github/`(CI) · `package.json`·설정 파일(tsconfig·eslint·vitest)
- `docs/plan/{00,03,05,06,07}.md`, `docs/install/`, `README.md` 갱신
- 공유(내 담당·W 리뷰): `CLAUDE.md` 「현재 작업 현황」

### 작업 패턴
1. `feat/` 브랜치 생성 → 내 레인만 구현 → push
2. 커밋 메시지 접두 `T-XX:`, 테스트 요청은 `[HANDOFF→W]`
3. 게이트: 로컬 `npm run check` 통과 → PR → CI 초록 → Instance-W 검증 → main merge
4. test-first: W가 먼저 커밋한 실패 골든/계약 테스트를 초록으로 만드는 것을 완료 기준으로 삼는다
5. 세션 시작 시 `scripts/agent-sync.sh pull`(SessionStart 훅 자동), 턴 종료 시 `scripts/agent-sync.sh post u "…"`

### 하지 말 것
- `tests/` · `skills/kwcag-guide/` 직접 수정(Instance-W 영역). 구현 중 최소 스모크만 허용
- `docs/plan/{01,02,04}.md` 명세 변경(Instance-W에 요청)
- `skills/kwcag-guide/references/kwcag22-checklist.md` 직접 확정(제안은 PR로)
- main 브랜치에 직접 push (항상 PR·CI 경유)

### 스킬
- `/backend` — Supabase 아님, SWWA 서버(MCP 도구·엔진·규칙) 구현 모드
- `/frontend` — 해당 없음(SWWA는 서버 전용, 이 항목은 EASYREAD 유산이라 참고만)
- `/devops` — CI·플러그인 배포·릴리스 모드
