# 표 접근성 점검 (a11y-review)

데이터 표는 5.3.1(1.3.1) "표의 구성" 대상이다.

## 핵심
- 데이터 표에는 `<caption>`으로 표 제목 — `k-table-caption`이 th 있는 표에 caption 없으면 잡는다.
- 제목 셀은 `<th>`로, `scope="col"`/`scope="row"` 지정 — `k-table-th-missing`가 td만 있는 데이터 표를 잡는다.
- 복잡한 표는 `headers`/`id`로 셀-제목 연결(axe `td-headers-attr`).

## 레이아웃 표 금지
- 배치 목적으로 `<table>`을 쓰지 말 것. 부득이하면 `role="presentation"`(그러면 위 규칙에서 제외).

## before / after
```html
<!-- before: 제목 셀·캡션 없음 -->
<table><tr><td>이름</td><td>금액</td></tr><tr><td>홍길동</td><td>1000</td></tr></table>

<!-- after -->
<table>
  <caption>2026년 예산 내역</caption>
  <tr><th scope="col">이름</th><th scope="col">금액</th></tr>
  <tr><td>홍길동</td><td>1000</td></tr>
</table>
```

## 검사
`check_html`로 caption·th 유무를 정적으로 확인. 병합 셀이 많은 복잡한 표는 스크린리더 낭독을
사람이 최종 확인(수동).
