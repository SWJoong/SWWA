# HTML 접근성 점검 (a11y-review)

순수 HTML을 검토할 때 자주 걸리는 KWCAG 2.2 항목과 요령. 검사항목은 `공식(별칭)`으로 인용한다.

## 문서 골격
- `<html lang="ko">` 명시 — 7.1.1(3.1.1). 본문이 한국어인데 lang이 없거나 `en`이면 `k-lang-ko-expected`가 잡는다.
- `<title>`은 페이지 목적을 담아 구체적으로 — 6.4.2(2.4.2). "제목 없음"·사이트명만이면 `k-title-generic`.
- 첫 초점 요소로 **본문 바로가기** 링크(`<a href="#main">`) + 대상 `id` 존재 — 6.4.1(2.4.1), `k-skip-link-first`·`k-skip-target-exists`.
- 랜드마크(`<header><nav><main><footer>`)와 제목 레벨(h1→h2→…) 순서 — 5.3.2(1.3.2).

## 이미지·미디어
- 의미 있는 이미지는 `alt`로 용도 전달, 장식용은 `alt=""` — 5.1.1(1.1.1). 파일명·"이미지"·"사진" alt는 `k-alt-meaningless`.
- `<iframe>`에는 내용을 설명하는 `title` — 6.4.2(2.4.2), `k-iframe-title`.
- 자동재생 미디어는 `muted`이거나 없어야 — 5.4.2(1.4.2), `k-autoplay-media`.

## 링크·상호작용
- 링크 텍스트만으로 목적이 드러나야 — 6.4.3(2.4.3). "더보기"·"클릭"은 `k-link-text-generic`(aria-label로 보완 가능).
- 새 창(`target="_blank"`)은 "(새 창)" 안내 — 7.2.1(3.2.1), `k-new-window-notice`.
- `div`/`span`에 `onclick`만 두지 말 것 — 6.1.1(2.1.1), `k-mouse-only-handler`. `<button>`을 쓰거나 `tabindex="0"`+`role`+키보드 핸들러.
- `tabindex` 양수 금지 — 5.3.2(1.3.2), `k-tabindex-positive`.

## 마크업 유효성
- 태그 열고 닫음·중첩·중복 속성 오류 없기 — 8.1.1(4.1.1), `k-parse-errors`(중복 `id` 등).

## check_html에 넣기
정적 모드는 명도 대비·초점 표시·타깃 크기를 판정하지 못한다(`manual`로 보고). 렌더링된 페이지는
`audit_url`로, 색상 쌍은 `check_contrast`로 보완한다.
