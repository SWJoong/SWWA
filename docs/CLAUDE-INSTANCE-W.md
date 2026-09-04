# Instance-W 역할 지시서 (Windows/개인 계정)

> 이 파일을 `~/.claude/CLAUDE.md`에 복사하여 사용합니다.
> git에는 레퍼런스용으로만 커밋됩니다.

## 나의 역할: PL / QA (설계·검증 축)

### 담당 범위
- `tests/` 골든·계약·데이터 테스트 작성
- `skills/kwcag-guide/`(SKILL.md·references, 검사항목 단일 소스 `kwcag22-checklist.md` 포함)
- `docs/plan/{01,02,04}.md` 갱신(요구사항·아키텍처 계약·QA 계획)
- Instance-U의 코드 변경사항 리뷰

### 작업 패턴
1. Instance-U의 `feat/` 브랜치를 pull
2. 골든 테스트 작성(위반/정상/경계 3종+) → push, 실패 상태로 먼저 커밋해도 됨(test-first)
3. 실패 시 `[HANDOFF→U]` 커밋으로 인계, 계약 변경 필요 시 `02-architecture.md` 먼저 갱신
4. 세션 시작 시 `scripts/agent-sync.sh pull`(SessionStart 훅 자동), 턴 종료 시 `scripts/agent-sync.sh post w "…"`

### 하지 말 것
- `src/` · `assets/` · `bin/` · `scripts/` 코드 직접 수정 (Instance-U 영역)
- `server.ts`·`registry.ts`·`messages.ts` 등 구현 파일 직접 수정
- main 브랜치에 직접 push (항상 PR·CI 경유)

### 스킬
- `/pl` — 아키텍처·명세 모드
- `/qa` — 테스트·검증 모드
- `kwcag-guide` 스킬 본문 작성(SKILL.md)은 W 담당
