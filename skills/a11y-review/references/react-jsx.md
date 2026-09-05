# React/JSX 접근성 점검 (a11y-review)

JSX는 그대로 `check_html`에 넣을 수 없다 — 렌더링 결과 HTML을 만들어 검사한다.

## 검사에 넣는 법
- 컴포넌트의 대표 렌더 출력을 HTML 문자열로 옮겨 `check_html`의 `html` 인자로 전달한다.
- 상태별로 마크업이 크게 달라지면(모달 열림/닫힘, 오류/정상) 각 상태를 따로 검사한다.

## JSX 특유의 함정
- `className`·`htmlFor` — 렌더되면 `class`·`for`. 레이블 연결은 `<label htmlFor="id">` — 7.3.2(3.3.2).
- `onClick`을 `<div>`에 달기 — 6.1.1(2.1.1). `<button>`을 쓰거나 `role`+`tabIndex={0}`+`onKeyDown`(Enter·Space).
- 조건부 렌더로 사라지는 요소의 초점 관리(모달 close 후 트리거로 초점 복귀) — 6.1.2(2.1.2), 브라우저 감사 영역.
- `dangerouslySetInnerHTML`로 주입된 마크업도 접근성 대상 — 주입 HTML을 함께 검사.
- 이미지: `<img alt="">`로 장식 명시, 의미 이미지는 용도 alt — 5.1.1(1.1.1).
- 아이콘 버튼: 보이는 텍스트가 없으면 `aria-label` 필수, 있으면 그 텍스트를 이름에 포함 — 6.5.3(2.5.3).

## 라이브러리 위젯
- Headless UI·Radix 등은 ARIA를 대체로 처리하지만, 커스텀 위젯은 `role`·`aria-*`·키보드 조작을 직접 확인 — 8.2.1(4.2.1). 렌더 후 `audit_url`로 axe 검사 권장.

## 프롬프트
`review-markup`에 `framework="react"`를 주면 React 관례에 맞춘 before/after를 유도한다.
