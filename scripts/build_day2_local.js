const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(REPO, 'templates', 'section_generic_template.html'), 'utf8');

// ---- Supply-chain map diagram (pure SVG, no external assets) ----
function supplyChainDiagram(rows, { width = 640 } = {}) {
  const rowH = 76;
  const topH = 56;
  const height = topH + rows.length * rowH + 20;
  const spineX = 60;
  const nodeR = 5;

  const spine = `<line x1="${spineX}" y1="${topH}" x2="${spineX}" y2="${topH + rows.length * rowH - rowH / 2}" stroke="#34353f" stroke-width="2"/>`;
  const hub = `
    <rect x="16" y="10" width="88" height="34" rx="6" fill="#7fa2ff" />
    <text x="60" y="31" font-size="13" font-weight="700" fill="#14151b" text-anchor="middle" font-family="IBM Plex Mono, monospace">iPhone</text>`;

  const items = rows.map((r, i) => {
    const cy = topH + i * rowH + rowH / 2 - rowH / 2 + 20;
    const badgeY = cy - 10;
    const companies = r.companies.map((c, ci) => {
      const bx = 130 + ci * (Math.min(c.length * 7.2 + 20, 230));
      return '';
    });
    // Build company chips inline, wrapping simply by fixed x offsets
    let chipX = 130;
    const chips = r.companies.map((c) => {
      const w = c.length * 8 + 22;
      const chip = `<rect x="${chipX}" y="${cy - 12}" width="${w}" height="24" rx="12" fill="${r.color}" fill-opacity="0.16" stroke="${r.color}" stroke-width="1"/>
        <text x="${chipX + w / 2}" y="${cy + 4}" font-size="11.5" fill="${r.color}" text-anchor="middle" font-family="'Noto Sans KR', sans-serif" font-weight="600">${c}</text>`;
      chipX += w + 8;
      return chip;
    }).join('');
    return `
      <circle cx="${spineX}" cy="${cy}" r="${nodeR}" fill="#f2b632"/>
      <line x1="${spineX + nodeR}" y1="${cy}" x2="118" y2="${cy}" stroke="#34353f" stroke-width="1.5"/>
      <text x="0" y="${cy - 12}" font-size="11" fill="#a3a3ab" font-family="IBM Plex Mono, monospace">${r.category}</text>
      ${chips}
      <text x="130" y="${cy + 26}" font-size="10.5" fill="#a3a3ab" font-family="'Noto Sans KR', sans-serif">${r.note}</text>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="auto" role="img" aria-label="아이폰 부품 공급망 지도">
      ${hub}${spine}
      <line x1="${spineX}" y1="44" x2="${spineX}" y2="${topH}" stroke="#34353f" stroke-width="2"/>
      ${items}
    </svg>`;
}

const diagram = supplyChainDiagram([
  { category: '디스플레이', companies: ['삼성디스플레이', 'LG디스플레이'], note: '한국 2사가 OLED 전량 공급 (중국 BOE는 품질 문제로 탈락)', color: '#7fa2ff' },
  { category: '메모리(D램)', companies: ['삼성전자', 'SK하이닉스'], note: 'AI발 수요 폭증으로 가격 급등, 中 CXMT는 결국 배제', color: '#f2b632' },
  { category: 'AP(핵심 칩)', companies: ['애플(설계)', 'TSMC(생산)'], note: '애플이 직접 설계, 대만 TSMC가 위탁 생산', color: '#6fd6a8' },
  { category: '카메라 이미지센서', companies: ['소니', '삼성전자'], note: '소니 10년 독점이 흔들리며 삼성이 처음 진입', color: '#e07be0' },
  { category: '최종 조립', companies: ['폭스콘', '타타그룹'], note: '중국 중심에서 인도로 급속히 이전 중', color: '#8f97a8' },
], {});

const parts = `
  <section class="part">
    <div class="part-label"><span class="idx">01</span> 부품 공급망</div>
    <h2 class="part-title">아이폰 한 대에 숨은 5개 나라, 5개 기업</h2>
    <p class="lead">아이폰은 애플이 설계하지만, 실제로 만드는 손길은 전 세계에 흩어져 있다. 디스플레이는 한국에서, 핵심 칩은 대만에서, 이미지센서는 일본과 한국에서, 최종 조립은 인도에서 이뤄진다. 부품별로 어떤 기업이 아이폰을 만드는지 지도로 정리했다.</p>
    <figure class="chart">
      ${diagram}
      <figcaption class="src">2026년 기준 주요 부품별 공급사 · 출처: 아래 섹션별 표기</figcaption>
    </figure>
  </section>

  <section class="part">
    <div class="part-label"><span class="idx">02</span> 디스플레이</div>
    <h2 class="part-title">화면은 이제 완전히 한국산</h2>
    <p class="lead">2026년 하반기 출시되는 아이폰18 프로·프로맥스와 폴더블 아이폰에 들어가는 OLED 패널은 삼성디스플레이와 LG디스플레이 두 한국 기업이 전량 공급한다. 중국 BOE는 이번 프로젝트에서 아예 제외됐다.</p>
    <p>BOE는 지난해 아이폰17 프로용 OLED 공급 승인을 받았지만 품질 문제로 납품에 차질을 겪었고, 이 전례가 올해 프로젝트 제외로 이어졌다. 업계는 이를 한국 OLED 기술력과 안정적인 양산 능력이 반영된 결과로 평가한다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://www.etnews.com/20260622000287">전자신문(2026.06.22)</a></div>
  </section>

  <section class="part">
    <div class="part-label"><span class="idx">03</span> 메모리(D램)</div>
    <h2 class="part-title">AI 반도체 열풍에, 애플도 가격을 못 낮췄다</h2>
    <p class="lead">아이폰에 들어가는 저전력 D램(LPDDR)은 삼성전자와 SK하이닉스가 공급한다. 그런데 전 세계 빅테크의 AI 인프라 투자로 D램 수요가 폭증하면서, 공급사들이 고부가 제품인 HBM(고대역폭메모리) 생산 비중을 늘렸고, 그 여파로 모바일용 D램 가격이 전분기 대비 최대 두 배 가까이 뛰었다.</p>
    <p>애플은 가격을 낮추려 중국 메모리 업체 CXMT의 D램을 테스트하기도 했지만, 결국 채택하지 않았다. 삼성전자와 SK하이닉스가 아이폰17에 쓰이는 12GB LPDDR5X 물량 협상에서 사실상 승리했고, 삼성전자는 최대 60~70% 물량을 확보한 것으로 추정된다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://zdnet.co.kr/view/?no=20260807082728">ZDNet코리아(2026.08.07)</a> · <a href="https://www.hankyung.com/article/2026080695481">한국경제(2026.08.06)</a></div>
  </section>

  <section class="part">
    <div class="part-label"><span class="idx">04</span> AP(핵심 칩)</div>
    <h2 class="part-title">설계는 애플, 생산은 대만 TSMC</h2>
    <p class="lead">아이폰의 두뇌인 AP(애플리케이션 프로세서)는 애플이 직접 설계하지만, 실제 반도체 생산은 대만 TSMC가 전담한다. 2026년 9월 공개될 예정인 차세대 A20 프로 칩은 TSMC의 2나노미터 공정을 처음 적용해, 이전 세대 대비 성능 18%, 전력 효율 약 30% 향상이 예상된다.</p>
    <p>A20 프로는 아이폰18 프로와 이번에 처음 나온 폴더블 아이폰(아이폰 울트라)에 탑재될 예정이다. 새 패키징 기술 도입 가능성도 거론되며, 배터리 사용 시간 연장과 발열 관리 개선이 기대된다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://zdnet.co.kr/view/?no=20260818075537">ZDNet코리아(2026.08.18)</a></div>
  </section>

  <section class="part">
    <div class="part-label"><span class="idx">05</span> 카메라·이미지센서</div>
    <h2 class="part-title">10년 넘은 소니 독점이 흔들린다</h2>
    <p class="lead">아이폰 카메라의 핵심 부품인 이미지센서는 10년 넘게 일본 소니가 독점 공급해왔다. 팀 쿡 애플 최고경영자가 직접 "소니가 10년 넘게 아이폰 카메라 부품을 공급해왔다"고 언급했을 정도다. 그런데 이 구도가 처음으로 깨지고 있다 — 삼성전자가 미국 오스틴 공장에서 생산한 이미지센서를 이르면 2027년부터 아이폰에 공급할 것으로 알려졌다.</p>
    <p>독점을 위협받은 소니는 대만 TSMC와 손잡았다. 두 회사는 2026 회계연도 안에 소니가 약 60%, TSMC가 약 40%를 출자하는 1조엔(약 9조원) 규모 합작회사를 설립해 차세대 이미지센서 개발에 나선다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://www.hankyung.com/article/202608104300i">한국경제(2026.08.10)</a></div>
  </section>

  <section class="part">
    <div class="part-label"><span class="idx">06</span> 최종 조립</div>
    <h2 class="part-title">중국에서 인도로, 사상 첫 '전 모델 인도 생산'</h2>
    <p class="lead">부품이 다 모이면 마지막으로 조립돼 완제품이 되는데, 이 조립 공정이 최근 몇 년 사이 중국에서 인도로 빠르게 옮겨가고 있다. 2025년 출시된 아이폰17은 프리미엄 모델(프로·프로맥스)까지 포함한 전 라인업을 인도에서 생산한 첫 사례였다 — 이전에는 일반 모델만 인도에서 만들고, 프리미엄 모델은 중국에서 생산했었다.</p>
    <p>애플의 최대 협력사 폭스콘이 인도에 여러 공장을 운영 중이며, 인도 타타그룹도 생산에 참여해 향후 2년 안에 인도 생산량의 절반을 담당할 계획이다. 시장조사업체 카운터포인트에 따르면 인도의 아이폰 생산 비중은 4년 전 6%에서 2026년 26%까지 늘어날 전망이다. 배경에는 미·중 무역 갈등 속에서 중국 의존도를 낮추려는 애플의 전략이 있다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://www.etnews.com/20250820000131">전자신문(2025.08.20)</a></div>
  </section>`;

const vals = {
  COMPANY_NAME: '애플 (Apple Inc.)',
  DAY_LABEL: 'DAY 2/6 · 사업 깊게 파기 ①',
  HEADLINE: '아이폰 한 대에 숨은 5개 나라, 5개 기업',
  DEK: '애플이 설계하는 아이폰은 실제로 한국·대만·일본·인도 기업들의 손을 거쳐 완성된다. 부품별 공급망을 따라가며 아이폰 하드웨어 사업의 실체를 살펴본다.',
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
