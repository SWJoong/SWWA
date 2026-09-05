---
name: a11y-review
description: 웹 UI 코드(HTML/React/Vue/Svelte/CSS)를 작성·수정·리뷰할 때 KWCAG 2.2 기준으로 접근성을 검토한다. "접근성 검토해줘", "이 컴포넌트 접근성 괜찮아?", "KWCAG 위반 있어?" 같은 요청이나 마크업·폼·표·미디어·ARIA 위젯 코드 변경 시 사용한다.
---

# a11y-review

웹 UI 코드를 KWCAG 2.2(한국형 웹 콘텐츠 접근성 지침) 기준으로 검토하고 수정안을 제시하는 스킬이다.
판정·측정은 `swwa` MCP 서버의 도구에 맡기고, 이 스킬은 언제 무엇을 호출하고 결과를 어떻게 설명할지
안내한다.

## 언제 사용하는가

- 웹 UI 코드(HTML·React/JSX·Vue·Svelte·CSS)를 작성·수정·리뷰할 때
- "접근성 검토", "KWCAG 위반 확인", "이 컴포넌트 접근성 괜찮아?" 같은 요청
- 폼·표·이미지·미디어·링크·모달·ARIA 위젯 등 접근성에 민감한 컴포넌트를 다룰 때

## 검토 절차

1. **`check_html` 호출** — 검토할 HTML(문자열 또는 파일 경로)을 정적 검사한다. 프레임워크 코드
   (JSX·SFC)는 렌더링된 HTML 조각으로 변환해 넣는다(아래 프레임워크별 참고).
2. **결과 인용** — Report의 `findings`·`checkpoints`를 읽고, 검사항목을 **공식 번호(별칭)** 형식
   `6.4.1(2.4.1)`으로 인용한다.
3. **수정안 제시** — 문제마다 before/after 코드로. 프레임워크 관례에 맞춘다.
4. **판정 구분** — 자동(도구가 확정)·보조(후보 탐지, 사람 확인)·수동(체크리스트)을 나눠 설명한다.
5. **수동·브라우저 항목 안내** — Report의 `manualChecklist`를 정리하고, 렌더링이 필요한 항목
   (명도 대비·초점 표시·타깃 크기)은 `audit_url` 브라우저 감사 또는 `check_contrast`로 보완하도록 안내.
6. **고지** — 자동 검사 결과는 "전문가·사용자 심사 전 참고 결과"임을 밝힌다.

프롬프트 `review-markup`을 쓰면 위 절차가 담긴 지시를 자동 생성할 수 있다.

## 도구 선택

| 상황 | 도구 |
|---|---|
| HTML/코드 정적 검사 | `check_html` |
| 색상 쌍 명도 대비만 빠르게 | `check_contrast` |
| 실제 렌더링 필요(초점·타깃 크기·대비) | `audit_url`(먼저 `browser_status` 확인) |
| 검사항목 뜻·WCAG 매핑 조회 | `lookup_checkpoint`(또는 `kwcag-guide` 스킬) |
| 컴포넌트별 점검 목록 | `get_checklist`(scope=component) |

## 참고 자료 (references/)

- 프레임워크: [html.md](references/html.md) · [react-jsx.md](references/react-jsx.md) · [vue-svelte.md](references/vue-svelte.md)
- 주제: [css.md](references/css.md) · [forms.md](references/forms.md) · [tables.md](references/tables.md) · [media.md](references/media.md) · [aria-widgets.md](references/aria-widgets.md)
- [korean-pitfalls.md](references/korean-pitfalls.md) — 국내 사이트에서 반복되는 함정(본문 바로가기·새 창·"더보기"·무의미 alt·캡차 등)

## 원칙

- 도구가 판정하지 못한 항목을 "문제없음"으로 단정하지 않는다 — 자동 검사 범위를 정직하게 밝힌다.
- 표준 원문을 그대로 옮기지 않고 요구사항을 자체 언어로 요약하며 검사항목 ID를 함께 인용한다.
