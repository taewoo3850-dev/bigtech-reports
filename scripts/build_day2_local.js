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
  { category: '모뎀칩', companies: ['퀄컴(미국)', 'C2(애플 자체)'], note: '미국은 퀄컴, 나머지 국가는 애플 자체 C2 모뎀 혼용', color: '#f28ba8' },
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
    <p>이 물량이 두 회사 실적에서 차지하는 비중도 상당하다. LG디스플레이는 2026년 2분기에 희망퇴직 비용 등 일회성 지출을 빼면 약 1280억원의 실질 흑자를 낼 것으로 추정되는데, 하반기 실적 개선의 핵심 동력으로 아이폰18 신제품용 OLED 패널 출하 확대가 꼽힌다. 애플이라는 단일 고객사의 주문량이 한국 디스플레이 업체의 분기 실적 흑자·적자를 가를 정도로 커진 셈이다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://www.etnews.com/20260622000287">전자신문(2026.06.22)</a> · <a href="https://magazine.hankyung.com/business/article/202606157472b">한경비즈니스(2026.06.15)</a></div>
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
    <h2 class="part-title">AI칩을 제일 먼저 만들었는데, AI에서 뒤처진 아이러니</h2>
    <p class="lead">AP(애플리케이션 프로세서)는 아이폰의 두뇌 역할을 하는 핵심 반도체다. 연산·그래픽 처리는 물론, 최근 스마트폰 업계의 최대 화두인 'AI를 기기 안에서 직접 돌리는 기능'(온디바이스 AI)도 이 칩이 전담한다. 다른 스마트폰 제조사 대부분은 퀄컴·미디어텍 같은 외부 업체가 만든 AP를 사서 쓰지만, 애플은 2010년 첫 자체 설계 AP(A4)를 시작으로 지금까지 모든 아이폰의 AP를 직접 설계해왔다.</p>
    <p>이 자체 설계 역량이 가장 빛을 발한 순간은 2017년이다. 애플은 아이폰8·X에 탑재한 'A11 바이오닉' 칩에 AI 연산 전용 회로인 '뉴럴 엔진'(NPU)을 처음 넣었는데, 이는 삼성전자·퀄컴보다 수년 앞선 시도였다. 이후 나온 모든 A시리즈 칩, 그리고 맥에 들어가는 M시리즈 칩까지 이 뉴럴 엔진 구조를 계승했다. 덕분에 아이폰은 사진 보정이나 음성 인식 같은 AI 기능을 사진·음성 데이터를 서버로 보내지 않고 기기 안에서 바로 처리할 수 있다 — 속도가 빠르고, 개인정보가 외부로 나가지 않는다는 장점이 있다.</p>
    <p>그런데 아이러니하게도, AI 전용 칩을 업계 최초로 만들었던 애플이 정작 요즘 벌어지는 '온디바이스 AI 경쟁'에서는 뒤처졌다는 평가를 받는다. 업계 경쟁 축이 단순 스펙 싸움에서 "온디바이스 AI를 얼마나 잘 구현하느냐"로 옮겨가면서, 퀄컴은 스냅드래곤 AP를 스마트폰 너머 PC·스마트워치·차량·AR글래스까지 아우르는 AI 플랫폼으로 확장 중이고, 삼성전자는 자체 칩 엑시노스 2700의 온디바이스 AI 연산 속도가 최신 퀄컴 칩보다 18% 빠르다는 자체 테스트 결과를 공개하기도 했다. 반면 애플은 자체 AI 기술 개발에 어려움을 겪으며 아이폰 시리(Siri)에 구글의 AI 모델 제미나이를 적용하는 방안까지 검토하는 것으로 알려졌다 — 칩(하드웨어) 경쟁력은 여전히 최상위권이지만, 그 위에서 돌아가는 AI 소프트웨어 경쟁력은 오히려 경쟁사에 밀리는 모습이다.</p>
    <p>한편 칩 생산 자체는 대만 TSMC에 전량 위탁한다. 2026년 9월 공개될 차세대 A20 프로는 TSMC의 2나노미터 공정을 처음 적용해 이전 세대 대비 성능 18%, 전력 효율 약 30% 향상이 예상되며, 아이폰18 프로와 이번에 처음 나온 폴더블 아이폰에 탑재될 예정이다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://zdnet.co.kr/view/?no=20260609075032">ZDNet코리아(2026.06.09)</a> · <a href="https://www.hankyung.com/article/2026082371511">한국경제(2026.08.23)</a> · <a href="https://zdnet.co.kr/view/?no=20260818075537">ZDNet코리아(2026.08.18)</a></div>
  </section>

  <section class="part">
    <div class="part-label"><span class="idx">05</span> 모뎀칩</div>
    <h2 class="part-title">퀄컴 매출의 20%를 차지했던 고객, 이제 절반은 독립했다</h2>
    <p class="lead">모뎀칩은 아이폰이 기지국과 무선으로 통화·데이터를 주고받게 해주는 통신 전용 반도체다. 화면·연산을 담당하는 AP와 달리, "밖과 연결되는 입과 귀" 역할만 전담한다. 애플은 AP는 2010년부터 직접 설계해왔지만, 모뎀칩만큼은 오랫동안 퀄컴 제품에 의존했다 — 해외 리서치사 트레피스(Trefis) 추정에 따르면 한때 애플 한 곳에서 나오는 매출이 퀄컴 모뎀 사업 매출의 약 20%에 달할 정도로 비중이 컸다.</p>
    <p>애플은 이 의존을 끊기 위해 2019년 인텔의 모뎀 사업부를 인수했고, 이를 기반으로 개발한 첫 자체 모뎀 'C1'을 2025년 초 아이폰16e에 처음 탑재했다. 실제 사용해본 결과 퀄컴 모뎀과 속도 차이는 거의 느껴지지 않았고, 전력 소모는 오히려 약 25% 낮아 배터리 효율에서는 앞서는 것으로 평가됐다. 후속작인 'C2' 모뎀은 2026년 출시돼 아이폰18 프로에 탑재된다.</p>
    <p>다만 C2도 아직 완전히 퀄컴을 넘어서지는 못했다. 초고속 5G 통신에 쓰이는 '밀리미터파' 기능을 지원하지 못하는 게 발목을 잡는다. 이미 밀리미터파 인프라에 막대한 투자를 해온 미국 통신사들이 이 기능이 빠진 모델을 받아들이지 않으면서, 2026년 현재 아이폰18 프로는 지역별로 다른 모뎀을 쓴다 — 미국 판매분은 여전히 퀄컴 모뎀을, 한국을 포함한 나머지 대부분 국가는 애플 자체 C2 모뎀을 넣는다. 그 결과 미국 모델은 퀄컴 덕에 최고 속도가 더 빠른 대신, 나머지 국가 모델보다 배터리 효율에서는 밀린다는 평가도 나온다.</p>
    <p>정리하면 애플은 절반의 성공을 거둔 상태다. 성능과 효율에서는 퀄컴을 위협할 수준까지 따라왔지만, 밀리미터파라는 마지막 한 조각 때문에 세계 최대 시장인 미국에서는 여전히 퀄컴에 기대야 한다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://zdnet.co.kr/view/?no=20260703091105">ZDNet코리아(2026.07.03)</a> · <a href="https://zdnet.co.kr/view/?no=20250301063853">ZDNet코리아(2025.03.01)</a> · <a href="https://www.trefis.com/stock/qcom/articles-v3/610419/qualcomms-largest-revenue-line-is-shrinking-from-both-sides/2026-08-06">Trefis(2026.08.06, 해외 리서치사 추정)</a></div>
  </section>

  <section class="part">
    <div class="part-label"><span class="idx">06</span> 카메라·이미지센서</div>
    <h2 class="part-title">10년 넘은 소니 독점이 흔들린다</h2>
    <p class="lead">아이폰 카메라의 핵심 부품인 이미지센서는 10년 넘게 일본 소니가 독점 공급해왔다. 팀 쿡 애플 최고경영자가 직접 "소니가 10년 넘게 아이폰 카메라 부품을 공급해왔다"고 언급했을 정도다. 그런데 이 구도가 처음으로 깨지고 있다 — 삼성전자가 미국 텍사스주 오스틴 공장에서 생산한 이미지센서를 내년 출시될 아이폰18에 처음 공급한다.</p>
    <p>이번 삼성 진입은 애플이 미국에 1000억 달러 규모 신규 투자를 발표하면서 함께 공개됐다. 애플과 삼성은 오스틴 공장에서 "세계 최초로 사용되는 칩 제조 기술"을 함께 개발 중이며, 삼성은 기존 오스틴 팹 라인 일부를 이미지센서 생산용으로 전환할 계획이다. 즉 이번 변화는 단순한 부품사 교체가 아니라, 애플의 미국 내 생산투자 확대 전략과 맞물려 있다.</p>
    <p>독점을 위협받은 소니도 가만히 있지 않았다. 대만 TSMC와 손잡고 2026 회계연도 안에 소니가 약 60%, TSMC가 약 40%를 출자하는 1조엔(약 9조원) 규모 합작회사를 설립해 차세대 이미지센서 개발에 나선다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://www.hankyung.com/article/202608104300i">한국경제(2026.08.10)</a> · <a href="https://www.etnews.com/20250807000028">전자신문(2025.08.07)</a></div>
  </section>

  <section class="part">
    <div class="part-label"><span class="idx">07</span> 최종 조립</div>
    <h2 class="part-title">중국에서 인도로, 사상 첫 '전 모델 인도 생산'</h2>
    <p class="lead">부품이 다 모이면 마지막으로 조립돼 완제품이 되는데, 이 조립 공정이 최근 몇 년 사이 중국에서 인도로 빠르게 옮겨가고 있다. 2025년 출시된 아이폰17은 프리미엄 모델(프로·프로맥스)까지 포함한 전 라인업을 인도에서 생산한 첫 사례였다 — 이전에는 일반 모델만 인도에서 만들고, 프리미엄 모델은 중국에서 생산했었다.</p>
    <p>애플의 최대 협력사 폭스콘이 인도에 여러 공장을 운영 중이며, 인도 타타그룹도 생산에 참여해 향후 2년 안에 인도 생산량의 절반을 담당할 계획이다. 시장조사업체 카운터포인트에 따르면 인도의 아이폰 생산 비중은 4년 전 6%에서 2026년 26%까지 늘어날 전망이다.</p>
    <p>이전을 서두르는 진짜 이유는 관세다. 트럼프 미국 대통령이 중국산 제품에 고율 관세를 예고하자, 애플은 상대적으로 관세가 낮은 인도에서 조립한 아이폰을 미국으로 들여오는 방식으로 부담을 줄이려 했다 — 실제로 미국에서 팔리는 아이폰의 절반 이상이 인도산으로 채워지기 시작했다. 다만 트럼프 대통령은 이런 흐름 자체에도 제동을 걸었다. 그는 팀 쿡 애플 최고경영자에게 직접 "인도에 공장을 짓는 걸 원치 않는다"며 미국 내 생산을 압박했고, 인도 등 해외에서 만든 아이폰에도 별도 관세를 매겨야 한다고 주장한 바 있다. 애플은 중국 의존도를 낮추면서도 미국 정치권의 압박까지 동시에 관리해야 하는 상황에 놓여 있다.</p>
    <div class="callout" style="margin-top:16px;">출처: <a href="https://www.etnews.com/20250820000131">전자신문(2025.08.20)</a> · <a href="https://www.hankyung.com/article/202505166516g">한국경제(2025.05.16)</a></div>
  </section>`;

const vals = {
  COMPANY_NAME: '애플 (Apple Inc.)',
  DAY_LABEL: 'DAY 2/6 · 사업 깊게 파기 ①',
  HEADLINE: '아이폰 한 대에 숨은 5개 나라, 6개 부품 이야기',
  DEK: '애플이 설계하는 아이폰은 실제로 한국·대만·일본·인도·미국 기업들의 손을 거쳐 완성된다. 부품별 공급망을 따라가며 아이폰 하드웨어 사업의 실체를 살펴본다.',
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
