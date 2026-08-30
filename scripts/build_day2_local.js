const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(REPO, 'templates', 'section_generic_template.html'), 'utf8');

const bizRows = [
  ['아이폰', '스마트폰 · 삼성 32%·애플 25%(폴더블 기준, 시장 신규 진입)·화웨이 24%'],
  ['평균판매가격(ASP)', '전년 대비 8% 상승'],
  ['출하량', '전년 대비 13% 증가'],
  ['매출총이익률', '47.9%(전분기 49.3%에서 소폭 둔화)'],
].map(([name, desc]) => `
      <div class="biz-row"><span class="biz-name">${name}</span><span class="biz-desc">${desc}</span></div>`).join('');

const parts = `
  <section class="part">
    <div class="part-label"><span class="idx">01</span> 어떻게 돈을 버는가</div>
    <h2 class="part-title">가격은 그대로, 프리미엄 비중을 늘리는 전략</h2>
    <p class="lead">애플 하드웨어 사업의 핵심은 아이폰이다. 2026년 4~6월 분기 아이폰 매출은 542억 5000만 달러로 총매출의 절반가량을 차지했다. 애플은 경쟁사들이 부품 원가 상승분을 가격에 반영해 스마트폰 가격을 올릴 때, 아이폰17 시리즈 가격을 대체로 동결하며 원가 상승분을 자체적으로 흡수했다.</p>
    <p>그 결과 2026년 2분기 글로벌 스마트폰 시장에서 애플의 매출 점유율은 49%로 역대 최고를 기록했다. 평균판매가격은 전년 대비 8%, 출하량은 13% 늘었고, 특히 중국·유럽·신흥시장에서 성과가 두드러졌다. 다만 이 과정에서 매출총이익률은 전분기 49.3%에서 47.9%로 소폭 낮아졌다 — 가격을 지키는 대신 마진 일부를 내준 셈이다.</p>
    <p>또 하나의 축은 '애플 업그레이드 프로그램'이다. 월 구독료를 내면 매년 최신 아이폰으로 기기를 교체할 수 있는 제도로, 소비자가 통신사 대신 애플과 직접 관계를 맺게 만들어 고가 모델 중심의 반복 구매를 유도한다.</p>
    <div class="biz-summary" style="margin-top:22px;">
      ${bizRows}
    </div>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://www.hankyung.com/article/202608056520g">한국경제(2026.08.05)</a></div>
  </section>

  <section class="part">
    <div class="part-label"><span class="idx">02</span> 경쟁구도</div>
    <h2 class="part-title">삼성의 안마당까지 들어간 애플의 폴더블 도전</h2>
    <p class="lead">2026년 8월, 애플은 처음으로 폴더블 아이폰을 공개하며 삼성전자가 오랫동안 지배해온 폴더블 스마트폰 시장에 직접 뛰어들었다. 업계는 2026년 글로벌 폴더블 스마트폰 출하량이 전년 대비 21% 늘어날 것으로 내다본다.</p>
    <p>시장조사업체 카운터포인트리서치 전망에 따르면 폴더블 시장 점유율은 삼성 32%(전년 40%에서 하락), 애플 25%(진입 첫해), 화웨이 24% 순이 될 것으로 예상된다. 삼성이 여전히 1위를 지키겠지만, 애플의 진입 자체가 "프리미엄 폴더블 제품의 기준을 한 단계 끌어올릴 것"이라는 평가가 나온다. 삼성도 차기 갤럭시Z8 시리즈로 더 넓은 화면과 AI 기능을 앞세워 맞불을 놓을 준비를 하고 있다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://www.hankyung.com/article/202607229000g">한국경제(2026.07.22)</a> · <a href="https://www.hankyung.com/article/2026082777441">한국경제(2026.08.27)</a></div>
  </section>`;

const vals = {
  COMPANY_NAME: '애플 (Apple Inc.)',
  DAY_LABEL: 'DAY 2/6 · 사업 깊게 파기 ①',
  HEADLINE: '가격은 지키고 점유율은 늘린다 — 애플 하드웨어의 승부수',
  DEK: '애플 매출의 절반을 차지하는 아이폰 사업이 요즘 어떻게 돈을 벌고, 누구와 경쟁하고 있는지 살펴본다.',
  PUBLISH_DATE: '2026-08-25',
  PARTS_HTML: parts,
};

let html = tpl;
for (const [k, v] of Object.entries(vals)) {
  html = html.split('{{' + k + '}}').join(v);
}

const unresolved = html.match(/\{\{[A-Z_]+\}\}/g);
if (unresolved) {
  console.error('UNRESOLVED PLACEHOLDERS:', unresolved);
  process.exit(1);
}

const outPath = path.join(REPO, 'scripts', 'day2_apple_local.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('wrote', outPath, html.length, 'bytes');
