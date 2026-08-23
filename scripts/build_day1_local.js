const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const ASSETS = path.join(REPO, 'assets', 'apple');

function b64img(name, mime) {
  const data = fs.readFileSync(path.join(ASSETS, name));
  return `data:${mime};base64,${data.toString('base64')}`;
}

const tpl = fs.readFileSync(path.join(REPO, 'templates', 'section1_template.html'), 'utf8');

const founderCards = [
  ['steve_jobs.jpg', '스티브 잡스', '공동창업자·초대 CEO'],
  ['steve_wozniak.jpg', '스티브 워즈니악', '공동창업자·기술개발 담당'],
].map(([f, name, role]) => `
      <div class="founder-card">
        <img src="${b64img(f, 'image/jpeg')}" alt="${name}">
        <div class="founder-cap"><span class="name">${name}</span><span class="role">${role}</span></div>
      </div>`).join('');

const hwCards = [
  ['iphone_official.jpg', '아이폰'],
  ['macbook_official.jpg', '맥'],
  ['applewatch_official.jpg', '애플워치'],
  ['airpods_official.jpg', '에어팟'],
].map(([f, name]) => `
      <div class="pg-card is-photo"><div class="pg-img-wrap"><img src="${b64img(f, 'image/jpeg')}" alt="${name}"></div><div class="pg-cap">${name}</div></div>`).join('');

const svcCards = [
  ['icloud_icon.png', '아이클라우드'],
  ['applemusic_icon.png', '애플뮤직'],
  ['appstore_icon.png', '앱스토어'],
  ['appletv_logo.png', '애플TV+'],
].map(([f, name]) => `
      <div class="pg-card is-icon"><div class="pg-img-wrap"><img src="${b64img(f, 'image/png')}" alt="${name}"></div><div class="pg-cap">${name}</div></div>`).join('');

const bizRows = [
  ['아이폰', '스마트폰 · 490억 3000만 달러'],
  ['서비스', '앱스토어·아이클라우드·애플뮤직 등 · 287억 5000만 달러(전년비 15%↑)'],
  ['웨어러블·홈·액세서리', '애플워치·에어팟 등 · 90억 달러'],
  ['맥', 'PC·노트북 · 87억 3000만 달러'],
  ['아이패드', '태블릿 · 69억 5000만 달러'],
].map(([name, desc]) => `
      <div class="biz-row"><span class="biz-name">${name}</span><span class="biz-desc">${desc}</span></div>`).join('');

const vals = {
  COMPANY_NAME: '애플 (Apple Inc.)',
  HEADLINE: '차고에서 시작해 시가총액 5조 달러까지, 애플의 50년',
  DEK: '1976년 스티브 잡스와 스티브 워즈니악이 시작한 애플은 2026년 창립 50주년을 맞아 세계 최초로 시가총액 5조 달러를 넘어섰다. 창업 스토리부터 사업 구조, 최근 실적까지 숫자로 짚어본다.',
  PUBLISH_DATE: '2026-08-23',

  FOUNDING_TITLE: '차고에서 시작된 회사, 50년 만에 세계 최대 기업으로',
  FOUNDER_CARDS_HTML: founderCards,
  FOUNDING_STORY_PARAGRAPHS_HTML: `
    <p class="lead">1976년 4월 1일, 스티브 잡스와 스티브 워즈니악, 로널드 웨인 세 사람이 창립계약서에 서명하며 애플을 공식 출범시켰다. 당시 지분은 잡스와 워즈니악이 각각 45%, 웨인이 10%씩 나눠 가졌다.</p>
    <p>웨인은 계약서에 서명한 지 얼마 지나지 않아 자신의 지분을 2300달러(약 265만원)에 넘기고 회사를 떠났다. 이 지분은 훗날 시가로 환산하면 약 350억 달러(약 40조원)에 달하는 것으로 추산된다. 세 사람이 서명한 창립계약서는 2011년 뉴욕 소더비 경매에서 애초 예상가(10만~15만 달러)를 훨씬 웃도는 약 159만 4500달러에 낙찰되며 역사적 가치를 인정받았다.</p>
    <p>애플은 2026년 4월 1일로 창립 50주년을 맞았다. 팀 쿡 최고경영자는 50주년 기념 서한에서 "세상을 바꿀 수 있다고 생각할 만큼 미친 사람들이 결국 세상을 바꾸는 사람들"이라는 문구를 인용하며, 1997년 잡스가 파산 위기의 애플에 복귀하며 내세운 '다르게 생각하라(Think Different)' 정신을 다시 강조했다.</p>`,
  FOUNDING_SOURCES: '<a href="https://www.hankyung.com/article/2026031395907">한국경제(2026.03.13)</a> · <a href="https://www.hankyung.com/article/201111304360i">한국경제(2011.11.30)</a>',

  BUSINESS_TITLE: '하드웨어에서 서비스까지, 애플의 사업 구조',
  BUSINESS_INTRO_TEXT: '애플의 사업은 크게 하드웨어와 서비스 두 축으로 나뉜다. 아이폰을 중심으로 맥·아이패드·웨어러블 기기를 판매하는 하드웨어 사업이 매출의 절반 이상을 차지하고, 이 기기들을 기반으로 한 앱스토어·아이클라우드·애플뮤직·애플TV+ 등 서비스 사업이 빠르게 몸집을 키우고 있다.',
  HW_GALLERY_CARDS_HTML: hwCards,
  SVC_GALLERY_CARDS_HTML: svcCards,
  BIZ_SUMMARY_ROWS_HTML: bizRows + '\n      <div class="callout" style="margin:14px 0 0;">출처: <a href="https://www.etnews.com/20251031000120">전자신문(2025.10.31)</a></div>',

  REVENUE_TITLE: '역대급 분기 매출, 순이익도 두 자릿수 증가',
  REVENUE_TEXT: '애플은 2026년 4~6월 분기(2026 회계연도 3분기)에 매출 1094억 2000만 달러를 기록해 전년 동기 대비 16.4% 늘었다고 2026년 7월 31일 밝혔다. 순이익은 297억 9000만 달러, 희석 주당순이익은 2.02달러로 전년(1.57달러)보다 늘었다. 아이폰과 맥 판매가 호조를 보인 반면 서비스 매출(307억 4000만 달러)은 시장 기대치에 못 미쳤다. 앞서 2025 회계연도 마지막 분기(2025년 7~9월)에는 매출 1025억 달러, 순이익 275억 달러(전년 동기 대비 87% 증가)를 기록하며 역대 4분기 기준 최고 실적을 냈다.<div class="callout" style="margin-top:16px;">출처: <a href="https://zdnet.co.kr/view/?no=20260731095245">ZDNet코리아(2026.07.31)</a> · <a href="https://www.hankyung.com/article/202607316822i">한국경제(2026.07.31)</a></div>',

  MARKETCAP_TITLE: '시가총액 5조 달러 시대 — 엔비디아 제치고 세계 1위로',
  MARKETCAP_TEXT: '애플 주가는 2026년 7월 28일 장중 342.89달러까지 오르며 창사 이래 처음으로 시가총액 5조 달러를 돌파했다. 이날 종가 기준 시가총액은 약 4조 9950억 달러였다. 하루 전인 7월 27일에는 엔비디아를 제치고 세계 시가총액 1위 자리를 탈환했다.<div class="callout" style="margin-top:16px;">출처: <a href="https://zdnet.co.kr/view/?no=20260729080544">ZDNet코리아(2026.07.29)</a></div>',

  STOCKPRICE_TITLE: '5조 달러 고점 이후 조정 국면',
  STOCKPRICE_TEXT: '애플 주가는 2026년 7월 28일 342.89달러로 사상 최고가를 기록한 이후 조정을 받고 있다. 2026년 8월 10일에는 투자은행 제프리스가 투자의견을 사실상 매도로 낮추고 목표주가를 8%가량 하향 조정하면서, 전 거래일 대비 1.53% 내린 308.26달러로 장을 마쳤다.<div class="callout" style="margin-top:16px;">출처: <a href="https://www.hankyung.com/article/202608114481i">한국경제(2026.08.11)</a></div>',
};

let html = tpl;
for (const [k, v] of Object.entries(vals)) {
  html = html.split('{{' + k + '}}').join(v);
}

// Remove chart figure blocks (no matplotlib available on this laptop for this test run)
html = html.replace(/<figure class="chart"[\s\S]*?<\/figure>/g, '');

// Remove leftover HTML-comment example blocks
html = html.replace(/<!--[\s\S]*?-->/g, '');

const unresolved = html.match(/\{\{[A-Z_]+\}\}/g);
if (unresolved) {
  console.error('UNRESOLVED PLACEHOLDERS:', unresolved);
  process.exit(1);
}

const outPath = path.join(REPO, 'scripts', 'day1_apple_local.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('wrote', outPath, html.length, 'bytes');
