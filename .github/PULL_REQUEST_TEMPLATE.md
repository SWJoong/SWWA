<!-- 하네스 레인: 구현·자산·CI는 src/·assets/·.github/(Instance-U), 골든·계약 테스트는 tests/(Instance-W) -->

## 개요
<!-- 무엇을, 왜 바꿨는지 한두 줄 -->

## 변경 사항
-

## 체크리스트
- [ ] 레인 준수 — 내 레인(U: `src/`·`assets/`·`bin/`·`scripts/`·`.github/`·설정 / W: `tests/`·`skills/kwcag-guide/`)만 변경
- [ ] `npm run check`(lint·typecheck·build·test·validate-assets) green (Node 22)
- [ ] 데이터 변경 시 `node scripts/validate-assets.mjs` 통과 + `assets/kwcag22.json`의 `dataVersion`·`updatedAt` 갱신
- [ ] 도구·프롬프트·리소스 인터페이스 변경 시 `docs/plan/02-architecture.md` 먼저 갱신(W 요청)
- [ ] 커밋 접두 `T-XX:` 확인, 필요 시 `[HANDOFF→W]`/`[HANDOFF→U]`

## 관련 이슈
<!-- 예: #123 -->
