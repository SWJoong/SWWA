---
name: a11y-review
description: 웹 UI 코드(HTML/React/Vue/Svelte/CSS)를 작성·수정·리뷰할 때 KWCAG 2.2 기준으로 접근성을 검토한다. "접근성 검토해줘", "이 컴포넌트 접근성 괜찮아?", "KWCAG 위반 있어?" 같은 요청이나 마크업·폼·표·미디어·ARIA 위젯 코드 변경 시 사용한다.
---

# a11y-review (구현 중)

> T-10에서 본문을 작성한다(레인: U). 현재는 스캐폴드 단계(T-02) 골격만 존재한다.

## 예정 개요

- `swwa` MCP 서버의 `check_html` 도구를 호출해 정적 검사(jsdom + axe-core + k-규칙)를 수행하고, KWCAG 2.2 검사항목 ID(`6.4.1(2.4.1)` 형식)를 인용하며 before/after 코드로 수정안을 제시한다.
- 프레임워크별(HTML/React·JSX/Vue·Svelte)·주제별(CSS, 폼, 표, 미디어, ARIA 위젯, 한국어 특이사항) 참고 자료는 `references/`에 둔다.
- 자동/보조/수동 판정을 구분하고, 렌더링이 필요한 항목은 "브라우저 감사 필요"로 안내한다.
- 자동 검사 결과는 항상 "전문가·사용자 심사 전 참고 결과"임을 고지한다.

## references/ (T-10 예정)

`html.md` · `react-jsx.md` · `vue-svelte.md` · `css.md` · `forms.md` · `tables.md` · `media.md` · `aria-widgets.md` · `korean-pitfalls.md`
