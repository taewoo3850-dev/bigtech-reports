# [회사 소개] 섹션 생성 가이드

이 폴더의 `templates/section1_template.html`과 `scripts/make_report_charts.py`는
빅테크 리포트의 [회사 소개] 섹션(01 창업스토리 ~ 05 주가)을 애플 버전과 동일한
품질/스타일로 재현하기 위한 재사용 템플릿입니다.

## 절차

1. `scripts/make_report_charts.py`를 열어 상단 `==== DATA (편집 구간) ====` 안의
   값들을 이번 주 리서치로 조사한 실제 수치로 교체하고 실행 → PNG 5개 생성
   (chart_revenue.png, chart_marketcap.png, chart_stockprice.png,
   chart_revenue_mix.png, chart_timeline.png)
2. `templates/section1_template.html`을 복사해서 `{{PLACEHOLDER}}`들을 채운다:
   - 텍스트류(`{{HEADLINE}}`, `{{DEK}}`, `{{FOUNDING_TITLE}}` 등)는 이번 주 리서치 내용으로
   - `{{FOUNDER_CARDS_HTML}}`, `{{HW_GALLERY_CARDS_HTML}}`, `{{SVC_GALLERY_CARDS_HTML}}`는
     저장소의 `assets/{company-slug}/`에 이미지가 있으면 그 파일을 base64로 인코딩해서 채우고,
     없으면 그 카드를 통째로 생략 (이미지 직접 생성 금지, 실제 이미지 없으면 텍스트만)
   - `{{CHART_*_B64}}`는 1번에서 만든 PNG들을 base64로 인코딩해서 채움
3. 완성된 HTML을 weasyprint로 PDF 변환 (마크다운 경유 없이 HTML을 직접 변환)
4. 이후 단계(저장소 커밋, 카카오 발송)는 기존과 동일

## 이미지 라이브러리 (assets/)

`assets/apple/`에 창업자 2명, 제품 4종(아이폰·맥·애플워치·에어팟), 서비스 로고 4종
(아이클라우드·애플뮤직·앱스토어·애플TV+)이 이미 준비되어 있습니다.
다른 기업은 아직 준비되어 있지 않으므로, 그 기업 차례가 되면 해당 이미지 카드들은
생략하고 텍스트+차트만으로 리포트를 작성하세요. 실제 이미지를 찾아서 넣는 것은
이 클라우드 환경에서 외부 이미지 서버 접속이 막혀 있어 불가능합니다 (WebSearch로
텍스트 검색은 가능하지만 이미지 다운로드는 안 됨).
