const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const ASSETS = path.join(REPO, 'assets', 'apple');

function b64img(name, mime) {
  const data = fs.readFileSync(path.join(ASSETS, name));
  return `data:${mime};base64,${data.toString('base64')}`;
}

// ---- Pure-SVG chart helpers (no python/matplotlib dependency) ----
const COLORS = ['#7fa2ff', '#f2b632', '#6fd6a8', '#e07be0', '#8f97a8'];

function donutChart(segments, { size = 220, thickness = 28 } = {}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const cx = size / 2, cy = size / 2, r = size / 2 - thickness / 2;
  let angle = -90;
  const arcs = segments.map((seg, i) => {
    const frac = seg.value / total;
    const startAngle = angle;
    const endAngle = angle + frac * 360;
    angle = endAngle;
    const large = (endAngle - startAngle) > 180 ? 1 : 0;
    const toXY = (a) => {
      const rad = (a * Math.PI) / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    };
    const [x1, y1] = toXY(startAngle);
    const [x2, y2] = toXY(endAngle);
    return `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" fill="none" stroke="${COLORS[i % COLORS.length]}" stroke-width="${thickness}"/>`;
  }).join('');
  const legend = segments.map((seg, i) => `
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;">
        <span style="width:9px;height:9px;border-radius:2px;background:${COLORS[i % COLORS.length]};flex-shrink:0;"></span>
        <span>${seg.label} <span style="color:#a3a3ab;">${((seg.value / total) * 100).toFixed(1)}%</span></span>
      </div>`).join('');
  return `
    <div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap;">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="매출 구성 도넛 차트">${arcs}</svg>
      <div style="display:flex;flex-direction:column;gap:8px;">${legend}</div>
    </div>`;
}

function barChart(quarters, { width = 640, height = 220, barValueKey = 'total', lineValueKey = 'net', barLabel = '총 매출', lineLabel = '순이익' } = {}) {
  const padL = 44, padB = 26, padT = 10, padR = 10;
  const plotW = width - padL - padR, plotH = height - padT - padB;
  const maxVal = Math.max(...quarters.map(q => q[barValueKey]));
  const n = quarters.length;
  const bw = (plotW / n) * 0.55;
  const gap = (plotW / n);
  const yScale = (v) => padT + plotH - (v / maxVal) * plotH;
  const bars = quarters.map((q, i) => {
    const x = padL + i * gap + (gap - bw) / 2;
    const y = yScale(q[barValueKey]);
    const h = padT + plotH - y;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="#7fa2ff" rx="2"/>`;
  }).join('');
  const linePts = quarters.map((q, i) => {
    const x = padL + i * gap + gap / 2;
    const y = yScale(q[lineValueKey]);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const dots = quarters.map((q, i) => {
    const x = padL + i * gap + gap / 2;
    const y = yScale(q[lineValueKey]);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#f2b632"/>`;
  }).join('');
  const labels = quarters.map((q, i) => {
    const x = padL + i * gap + gap / 2;
    return `<text x="${x.toFixed(1)}" y="${height - 6}" font-size="9.5" fill="#a3a3ab" text-anchor="middle" font-family="IBM Plex Mono, monospace">${q.label}</text>`;
  }).join('');
  const gridline = `<line x1="${padL}" y1="${padT + plotH}" x2="${width - padR}" y2="${padT + plotH}" stroke="#34353f" stroke-width="1"/>`;
  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="auto" role="img" aria-label="${barLabel}·${lineLabel} 추이 차트">
      ${gridline}${bars}<polyline points="${linePts}" fill="none" stroke="#f2b632" stroke-width="2"/>${dots}${labels}
    </svg>
    <div style="display:flex;gap:16px;margin-top:6px;font-size:11px;">
      <span><span style="display:inline-block;width:9px;height:9px;background:#7fa2ff;border-radius:2px;margin-right:5px;"></span>${barLabel}</span>
      <span><span style="display:inline-block;width:9px;height:9px;background:#f2b632;border-radius:50%;margin-right:5px;"></span>${lineLabel}</span>
    </div>`;
}

function lineTrendChart(points, { width = 640, height = 160, unit = '' } = {}) {
  const padL = 40, padB = 22, padT = 14, padR = 10;
  const plotW = width - padL - padR, plotH = height - padT - padB;
  const vals = points.map(p => p.value);
  const maxVal = Math.max(...vals), minVal = Math.min(...vals) * 0.97;
  const n = points.length;
  const xStep = plotW / (n - 1);
  const yScale = (v) => padT + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
  const pts = points.map((p, i) => `${(padL + i * xStep).toFixed(1)},${yScale(p.value).toFixed(1)}`).join(' ');
  const dots = points.map((p, i) => {
    const x = padL + i * xStep, y = yScale(p.value);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${p.highlight ? '#f2b632' : '#7fa2ff'}"/>`;
  }).join('');
  const anchorFor = (i) => (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle');
  const labels = points.map((p, i) => {
    const x = padL + i * xStep;
    return `<text x="${x.toFixed(1)}" y="${height - 4}" font-size="9.5" fill="#a3a3ab" text-anchor="${anchorFor(i)}" font-family="IBM Plex Mono, monospace">${p.label}</text>`;
  }).join('');
  const valueLabels = points.map((p, i) => {
    const x = padL + i * xStep, y = yScale(p.value);
    return `<text x="${x.toFixed(1)}" y="${(y - 8).toFixed(1)}" font-size="9.5" fill="${p.highlight ? '#f2b632' : '#e7e7ea'}" text-anchor="${anchorFor(i)}" font-family="IBM Plex Mono, monospace">${p.value}${unit}</text>`;
  }).join('');
  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="auto" role="img" aria-label="추이 라인 차트">
      <polyline points="${pts}" fill="none" stroke="#7fa2ff" stroke-width="2"/>${dots}${labels}${valueLabels}
    </svg>`;
}

function dataTable(headers, rows) {
  const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const tbody = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<table class="data-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
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
  ['iphone_official.jpg', '아이폰', 'https://www.apple.com/kr/iphone/'],
  ['macbook_official.jpg', '맥', 'https://www.apple.com/kr/mac/'],
  ['applewatch_official.jpg', '애플워치', 'https://www.apple.com/kr/watch/'],
  ['airpods_official.jpg', '에어팟', 'https://www.apple.com/kr/airpods/'],
].map(([f, name, url]) => `
      <a class="pg-card is-photo" href="${url}"><div class="pg-img-wrap"><img src="${b64img(f, 'image/jpeg')}" alt="${name}"></div><div class="pg-cap">${name}<span class="pg-link-hint">자세히 보기 →</span></div></a>`).join('');

const svcCards = [
  ['icloud_icon.png', '아이클라우드', 'https://www.apple.com/kr/icloud/'],
  ['applemusic_icon.png', '애플뮤직', 'https://www.apple.com/kr/apple-music/'],
  ['appstore_icon.png', '앱스토어', 'https://www.apple.com/kr/app-store/'],
  ['appletv_logo.png', '애플TV+', 'https://www.apple.com/kr/apple-tv-plus/'],
].map(([f, name, url]) => `
      <a class="pg-card is-icon" href="${url}"><div class="pg-img-wrap"><img src="${b64img(f, 'image/png')}" alt="${name}"></div><div class="pg-cap">${name}<span class="pg-link-hint">자세히 보기 →</span></div></a>`).join('');

const bizRows = [
  ['아이폰', '스마트폰 · 490억 3000만 달러'],
  ['서비스', '앱스토어·아이클라우드·애플뮤직 등 · 287억 5000만 달러(전년비 15%↑)'],
  ['웨어러블·홈·액세서리', '애플워치·에어팟 등 · 90억 달러'],
  ['맥', 'PC·노트북 · 87억 3000만 달러'],
  ['아이패드', '태블릿 · 69억 5000만 달러'],
].map(([name, desc]) => `
      <div class="biz-row"><span class="biz-name">${name}</span><span class="biz-desc">${desc}</span></div>`).join('');

// 최근 8개 분기 (2024 회계연도 4분기 ~ 2026 회계연도 3분기) 매출/순이익 데이터
// 단위: 백만 달러. 출처: 애플 공식 분기 실적발표(10-Q, apple.com/newsroom)
const QUARTERS = [
  { label: '24 Q4', iphone: 46222, services: 24972, total: 94930, net: 14736 },
  { label: '25 Q1', iphone: 69138, services: 26340, total: 124300, net: 36330 },
  { label: '25 Q2', iphone: 46841, services: 26645, total: 95359, net: 24780 },
  { label: '25 Q3', iphone: 44582, services: 27423, total: 94036, net: 23434 },
  { label: '25 Q4', iphone: 49025, services: 28750, total: 102466, net: 27466 },
  { label: '26 Q1', iphone: 85269, services: 30013, total: 143756, net: 42097 },
  { label: '26 Q2', iphone: 56994, services: 30976, total: 111184, net: 29578 },
  { label: '26 Q3', iphone: 54252, services: 30739, total: 109417, net: 29789 },
].map(q => ({ ...q, totalBil: +(q.total / 1000).toFixed(1), netBil: +(q.net / 1000).toFixed(1) }));

const revenueTableHtml = dataTable(
  ['분기', '아이폰', '서비스', '총매출', '순이익'],
  QUARTERS.map(q => [
    q.label,
    `${(q.iphone / 100).toFixed(0)}억`,
    `${(q.services / 100).toFixed(0)}억`,
    `${(q.total / 100).toFixed(0)}억`,
    `${(q.net / 100).toFixed(0)}억`,
  ])
);
const revenueBarChartHtml = barChart(
  QUARTERS.map(q => ({ label: q.label, total: q.totalBil, net: q.netBil })),
  { barValueKey: 'total', lineValueKey: 'net', barLabel: '총 매출(십억 달러)', lineLabel: '순이익(십억 달러)' }
);

// 시가총액 연도말 기준 (companiesmarketcap.com) + 2026-07-28 장중 최고치
const marketcapTableHtml = dataTable(
  ['시점', '시가총액'],
  [
    ['2024년 말', '3조 7660억 달러'],
    ['2025년 말', '3조 9970억 달러'],
    ['2026-07-28 (사상 최고)', '4조 9950억 달러'],
    ['2026년 8월 현재', '4조 5140억 달러'],
  ]
);

// 2026년 주요 시점 주가 (한국경제·ZDNet코리아 보도 기준 재구성, 월별 약식 추이)
const stockPricePoints = [
  { label: "26.01", value: 250 },
  { label: "26.03", value: 265 },
  { label: "26.05", value: 315 },
  { label: "26.07.28", value: 342.89, highlight: true },
  { label: "26.08.11", value: 308.26 },
];
const stockPriceChartHtml = lineTrendChart(stockPricePoints, { unit: '' });

// 2026 회계연도 3분기(2026.06.27 마감) 세그먼트 매출 구성
const mixDonutHtml = donutChart([
  { label: '아이폰', value: 54252 },
  { label: '서비스', value: 30739 },
  { label: '맥', value: 10352 },
  { label: '웨어러블·홈', value: 7883 },
  { label: '아이패드', value: 6191 },
]);

const vals = {
  COMPANY_NAME: '애플 (Apple Inc.)',
  HEADLINE: '차고에서 시작해 시가총액 5조 달러까지, 애플의 50년',
  DEK: '1976년 스티브 잡스와 스티브 워즈니악이 시작한 애플은 2026년 창립 50주년을 맞아 세계 최초로 시가총액 5조 달러를 넘어섰다. 창업 스토리부터 사업 구조, 최근 실적까지 숫자로 짚어본다.',
  PUBLISH_DATE: '2026-08-23',

  FOUNDING_TITLE: '차고에서 시작된 회사, 50년 만에 세계 최대 기업으로',
  FOUNDER_CARDS_HTML: founderCards,
  FOUNDING_STORY_PARAGRAPHS_HTML: `
    <p class="lead">1976년 4월 1일 저녁, 21세의 스티브 잡스는 26세의 스티브 워즈니악을 데리고 42세의 로널드 웨인의 집을 찾았다. 워즈니악과 30분 정도 대화한 끝에 그가 설계한 회로를 회사 소유로 하는 데 동의하자, 잡스는 그 자리에서 "회사를 설립하자"고 선언했고 세 사람은 3쪽짜리 동업 계약서를 작성했다. 지분은 잡스와 워즈니악이 각각 45%, 나이가 많아 두 사람의 중재자 역할을 하던 웨인이 10%를 가졌다. 애플의 첫 로고 — 뉴턴이 사과나무 아래 앉아 있는 모습 — 를 그린 사람도 웨인이었다.</p>
    <p>애플은 창업 직후 애플 I 컴퓨터 50대 주문을 받았고, 잡스는 부품을 외상으로 조달했다. 자산이 없던 젊은 잡스·워즈니악과 달리 40대로 집과 계좌를 압류당할 위험을 안고 있던 웨인은 재정적 책임을 우려해 회사를 떠났다. 웨인은 이후 "지분을 팔지 않았다"며, 동업 관계에서 이름을 빼는 서류를 제출할 때 담당 공무원의 제안으로 800달러가 함께 적혔고, 이후 잡스가 보낸 800달러 수표를 받았을 뿐이라고 밝혔다.</p>
    <p>애플은 2026년 4월 1일로 창립 50주년을 맞았다. 팀 쿡 최고경영자는 50주년 기념 서한에서 "세상을 바꿀 수 있다고 생각할 만큼 미친 사람들이 결국 세상을 바꾸는 사람들"이라는 문구를 인용하며, 1997년 잡스가 파산 위기의 애플에 복귀하며 내세운 '다르게 생각하라(Think Different)' 정신을 다시 강조했다.</p>`,
  FOUNDING_SOURCES: '<a href="https://economychosun.com/site/data/html_dir/2026/05/18/2026051800018.html">이코노미조선(2026.05.18)</a> · <a href="https://www.hankyung.com/article/2026031395907">한국경제(2026.03.13)</a>',

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

// Replace chart <figure> blocks with real inline-SVG charts/tables (no python/matplotlib needed).
// Matched by the unique Korean text still present in each figure's alt/figcaption after substitution.
// Finds the marker text, then locates the tightest enclosing <figure class="chart">...</figure>
// around it (not a regex spanning multiple figures — avoids swallowing already-replaced figures).
function replaceFigure(html, marker, replacementHtml) {
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) {
    console.error('WARNING: chart figure marker not found:', marker);
    return html;
  }
  const figStart = html.lastIndexOf('<figure class="chart"', markerIdx);
  const figEndTagIdx = html.indexOf('</figure>', markerIdx);
  if (figStart === -1 || figEndTagIdx === -1) {
    console.error('WARNING: could not bound figure for marker:', marker);
    return html;
  }
  const figEnd = figEndTagIdx + '</figure>'.length;
  return html.slice(0, figStart) + replacementHtml + html.slice(figEnd);
}

html = replaceFigure(html, '매출 구성', `
    <figure class="chart">
      ${mixDonutHtml}
      <figcaption class="src">2026 회계연도 3분기(2026.06.27 마감) 기준 · 출처: <a href="https://www.apple.com/newsroom/2026/07/apple-reports-third-quarter-results/">Apple Newsroom(2026.07.31)</a></figcaption>
    </figure>`);

// 하드웨어·서비스 약식 타임라인은 이번 데이터 조사 범위 밖이라 생략 (억지로 만들지 않음)
html = replaceFigure(html, '타임라인', '');

html = replaceFigure(html, '매출 순이익 추이', `
    <figure class="chart">
      ${revenueTableHtml}
      ${revenueBarChartHtml}
      <figcaption class="src">최근 8개 분기(2024 회계연도 4분기~2026 회계연도 3분기) · 출처: <a href="https://www.apple.com/newsroom/2026/07/apple-reports-third-quarter-results/">Apple Newsroom 분기 실적발표</a></figcaption>
    </figure>`);

html = replaceFigure(html, '시가총액 추이', `
    <figure class="chart">
      ${marketcapTableHtml}
      <figcaption class="src">출처: <a href="https://zdnet.co.kr/view/?no=20260729080544">ZDNet코리아(2026.07.29)</a></figcaption>
    </figure>`);

html = replaceFigure(html, '주가 추이', `
    <figure class="chart">
      ${stockPriceChartHtml}
      <figcaption class="src">단위: 달러 · 2026년 주요 시점 기준 약식 추이 · 출처: <a href="https://www.hankyung.com/article/202608114481i">한국경제(2026.08.11)</a></figcaption>
    </figure>`);

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
