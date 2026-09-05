# Vue/Svelte 접근성 점검 (a11y-review)

Vue SFC·Svelte 컴포넌트도 렌더 결과 HTML로 변환해 `check_html`에 넣는다.

## 공통
- 템플릿 문법(`v-if`/`{#if}`, `v-for`/`{#each}`, `:class`)은 렌더되면 표준 HTML — HTML 규칙 그대로 적용.
- `@click`(Vue)·`on:click`(Svelte)을 비대화형 요소에 달지 말 것 — 6.1.1(2.1.1). `<button>` 또는 `role`+`tabindex`+키보드 핸들러.
- 폼: `<label for>` 연결, `v-model`/`bind:value`와 별개로 레이블은 반드시 — 7.3.2(3.3.2).

## Vue 특이사항
- `<component :is>`로 태그가 바뀌면 접근성 시맨틱도 바뀐다 — 실제 렌더 태그 기준으로 검사.
- 트랜지션(`<Transition>`)으로 나타나는 콘텐츠의 초점·자동 변경 — 6.1.2(2.1.2)·6.2.2(2.2.2), 브라우저 감사.
- `v-html`로 주입한 마크업도 검사 대상.

## Svelte 특이사항
- Svelte 컴파일러는 `<a>`에 href 없음, 레이블 미연결 등 일부 a11y 경고를 빌드 타임에 낸다 — 이를 무시하지 말 것. 다만 KWCAG 검사항목 판정은 `check_html`/`audit_url`로 별도 확인.
- `{@html ...}` 주입 마크업 검사.

## 검사 흐름
정적 조각은 `check_html`, 상호작용·초점·대비는 렌더 후 `audit_url`. `review-markup`에
`framework="vue"` 또는 `"svelte"`를 지정한다.
