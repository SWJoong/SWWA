---
name: kwcag-guide
description: KWCAG 2.2(한국형 웹 콘텐츠 접근성 지침) 검사항목 33개, WCAG 2.2 대응, 품질인증 기준을 조회하거나 설명할 때 사용한다. "6.4.1이 뭐야", "이 항목 WCAG 몇 번이야", "인증 기준 알려줘", "검사항목 체크리스트 줘" 같은 요청 시 사용한다.
---

# kwcag-guide

KWCAG 2.2 검사항목·WCAG 2.2 매핑·품질인증 기준의 **단일 소스 지식** 스킬이다. 판정 로직은 갖지
않는다 — 조회는 `swwa` MCP 서버의 도구·리소스에 위임하고, 이 스킬은 언제 무엇을 호출할지와 어떻게
설명할지를 안내한다.

## 언제 사용하는가

- 검사항목 ID(공식 번호 또는 별칭, 예 `6.4.1`/`2.4.1`)를 물어볼 때
- WCAG SC ↔ KWCAG 대응을 물어볼 때(`wcag:2.4.7`처럼 접두사 사용 권장)
- axe 규칙 ID로 관련 검사항목을 역으로 찾을 때
- 컴포넌트(폼·표·이미지·미디어·링크·내비게이션·모달·캐러셀·인증·iframe·위젯)별 체크리스트가 필요할 때
- 품질인증 절차·기준(전문가/사용자 심사, 준수율)을 물어볼 때

## 무엇을 호출하는가

| 상황 | 도구/리소스 |
|---|---|
| 특정 검사항목 상세 조회 | `lookup_checkpoint`(`query`에 ID·별칭·axe 규칙 ID·키워드) |
| 스코프별 체크리스트(검사항목/컴포넌트/페이지/사용자평가) | `get_checklist` |
| 33개 전체 표가 필요할 때 | 리소스 `swwa://kwcag22` |
| 검사항목 1건 JSON | 리소스 `swwa://kwcag22/{id}` |
| WCAG↔KWCAG↔axe 매핑 전체 | 리소스 `swwa://mapping/wcag22` |
| 품질인증 절차·기준 | 리소스 `swwa://certification` |

## 답변 작성 원칙

1. 검사항목을 인용할 때는 항상 **공식 번호(별칭)** 형식(`6.4.1(2.4.1)`)을 쓴다.
2. 자동화 등급(자동/보조/수동/N-A)을 함께 알려주고, 자동 검사 도구(`check_html`·`audit_url`)의
   결과는 "전문가·사용자 심사 전 참고 결과"임을 고지한다.
3. 표준 원문을 그대로 옮기지 않는다 — 요구 문장 한 줄 인용 + 이 스킬/도구의 자체 요약을 쓴다.
4. `needsVerification` 표시가 있는 수치(품질인증 준수율·유효기간 등)는 "인증기관 공지로 재확인
   필요"를 덧붙인다.

## 참고 자료

- [kwcag22-checklist.md](references/kwcag22-checklist.md) — 33개 검사항목 단일 소스(ADR-04)
- [wcag-mapping.md](references/wcag-mapping.md) — WCAG 2.2 A·AA 전체 ↔ KWCAG 대조
- [sources.md](references/sources.md) — 출처·확인일·라이선스
- [certification.md](references/certification.md) — 웹 접근성 품질인증 절차·기준(재확인 필요 수치 포함)
- [mobile-app-guideline.md](references/mobile-app-guideline.md) — 모바일 앱 접근성 지침 2.0 요약(웹뷰는 KWCAG로 점검)
- [glossary.md](references/glossary.md) — 용어집(공식 번호/별칭·자동화 등급·k/b/axe 규칙·도구 등)
