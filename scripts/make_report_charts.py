# -*- coding: utf-8 -*-
# 빅테크 리포트 [회사 소개] 섹션용 차트 5종 생성 스크립트.
# 매주 회사가 바뀔 때마다 아래 "==== DATA (편집 구간) ====" 안의 값만
# 그 주 리서치로 조사한 실제 수치로 바꿔서 실행하면 5개 PNG가 생성됨.
# 실제 이미지(제품/인물 사진)는 이 스크립트로 만들지 않음 — 저장소 assets/{company}/에서 가져오거나 생략.

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

for _fp in ('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
            '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'):
    try:
        fm.fontManager.addfont(_fp)
    except Exception:
        pass
plt.rcParams['font.family'] = 'Noto Sans CJK KR'
plt.rcParams['axes.unicode_minus'] = False

BG = '#12131a'
FG = '#f2f2f0'
MUTED = '#9a9ba6'
GRID = '#33343d'
ACCENT1 = '#5b8def'
ACCENT2 = '#f2b632'
MIX_COLORS = ['#5b8def', '#f2b632', '#e8677d', '#5bc0a8', '#9d7fe8', '#e0a458']
HW = '#f2b632'
SVC = '#5b8def'

# ==== DATA (편집 구간) ====================================================
# 모든 수치는 화이트리스트 7개 언론사(연합뉴스·조선일보·중앙일보·동아일보·
# 한국경제·ZDNet코리아·전자신문) 기사만 근거로 함. 섹션당 출처 최대 2개 원칙 준수.
COMPANY = '애플'

# 1) 최근 2개 분기 매출·순이익 비교 (10억 달러 단위)
# 다년간 연간 시계열은 화이트리스트 내에서 전체를 확인하지 못해, 실제로
# 화이트리스트 매체가 보도한 가장 최근 두 분기 실적으로 대체.
QUARTERS = ['2025년 7~9월\n(2025 회계연도 4분기)', '2026년 4~6월\n(2026 회계연도 3분기)']
REVENUE_Q = [102.5, 109.42]
NET_INCOME_Q = [27.5, 29.79]
REVENUE_SOURCE = ('출처: 전자신문(2025.10.31, etnews.com/20251031000120) · '
                   'ZDNet코리아(2026.07.31, zdnet.co.kr/view/?no=20260731095245)')
REVENUE_SOURCE_LINKS = [
    ('전자신문(2025.10.31)', 'https://www.etnews.com/20251031000120'),
    ('ZDNet코리아(2026.07.31)', 'https://zdnet.co.kr/view/?no=20260731095245'),
]

# 2) 시가총액 — 화이트리스트에서 확인된 두 이정표만 사용
MC_LABELS = ['2018.8.2\n1조달러 돌파', '2026.7.28\n5조달러 돌파(사상 최고)']
MARKETCAP_USD_B = [1002, 4995]
MARKETCAP_SOURCE = ('출처: ZDNet코리아(2018.08.03, zdnet.co.kr/view/?no=20180803084216) · '
                     'ZDNet코리아(2026.07.29, zdnet.co.kr/view/?no=20260729080544)')
MARKETCAP_SOURCE_LINKS = [
    ('ZDNet코리아(2018.08.03)', 'https://zdnet.co.kr/view/?no=20180803084216'),
    ('ZDNet코리아(2026.07.29)', 'https://zdnet.co.kr/view/?no=20260729080544'),
]

# 3) 주가 — 사상 최고가 시점과 가장 최근 종가
SP_LABELS = ['2026.7.28\n사상 최고가(장중)', '2026.8.10\n최근 종가']
STOCK_PRICE = [342.89, 308.26]
STOCK_PRICE_SOURCE = ('출처: ZDNet코리아(2026.07.29, zdnet.co.kr/view/?no=20260729080544) · '
                       '한국경제(2026.08.11, hankyung.com/article/202608114481i)')
STOCK_PRICE_SOURCE_LINKS = [
    ('ZDNet코리아(2026.07.29)', 'https://zdnet.co.kr/view/?no=20260729080544'),
    ('한국경제(2026.08.11)', 'https://www.hankyung.com/article/202608114481i'),
]

# 4) 매출 구성 (2025 회계연도 4분기, 2025년 7~9월, 2025년 10월 31일 발표)
MIX_LABELS = ['아이폰', '서비스', '웨어러블·홈·액세서리', '맥', '아이패드']
MIX_USD_B = [49.03, 28.75, 9.0, 8.73, 6.95]
_total = sum(MIX_USD_B)
MIX_PCT = [round(v / _total * 100, 1) for v in MIX_USD_B]
MIX_YEAR_LABEL = '2025년 7~9월 분기(2025 회계연도 4분기, 2025.10.31 발표)'
MIX_TOTAL_LABEL = f'${_total:.1f}B (분기)'
MIX_SOURCE = '출처: 전자신문(2025.10.31, etnews.com/20251031000120)'
MIX_SOURCE_LINKS = [
    ('전자신문(2025.10.31)', 'https://www.etnews.com/20251031000120'),
]

# 5) 하드웨어·서비스 통합 타임라인 — 제품 출시 연도(잘 알려진 일반 사실, 별도 인용 불필요)
TIMELINE_EVENTS = [
    (1976, '창업', 1, 'hw'),
    (1984, '매킨토시', -1, 'hw'),
    (1998, '아이맥', 1, 'hw'),
    (2001, '아이팟', -1, 'hw'),
    (2007, '아이폰', 1, 'hw'),
    (2008, '앱스토어', -1, 'svc'),
    (2010, '아이패드', 1, 'hw'),
    (2011, '아이클라우드', -1, 'svc'),
    (2014, '애플페이', 1, 'svc'),
    (2015, '애플워치', -1, 'hw'),
    (2019, '애플TV+', 1, 'svc'),
    (2024, '비전프로', -1, 'hw'),
    (2026, '창립 50주년', 1, 'hw'),
]
TIMELINE_YEAR_RANGE = '1976~2026'
# ==========================================================================


def style_ax(ax):
    ax.set_facecolor(BG)
    ax.figure.set_facecolor(BG)
    for spine in ax.spines.values():
        spine.set_color(GRID)
    ax.tick_params(colors=FG)
    ax.xaxis.label.set_color(FG)
    ax.yaxis.label.set_color(FG)
    ax.title.set_color(FG)
    ax.grid(axis='y', color=GRID, linewidth=0.6, alpha=0.6)


def make_revenue_income():
    fig, ax = plt.subplots(figsize=(9,5), dpi=160)
    style_ax(ax)
    x = np.arange(len(QUARTERS))
    w = 0.32
    ax.bar(x - w/2, REVENUE_Q, width=w, color=ACCENT1, label='매출')
    ax.bar(x + w/2, NET_INCOME_Q, width=w, color=ACCENT2, label='순이익')
    ax.set_xticks(list(x))
    ax.set_xticklabels(QUARTERS)
    ax.set_ylabel('10억 달러')
    ax.set_title(f'{COMPANY} 최근 2개 분기 매출·순이익 비교', fontsize=13, pad=14)
    ax.legend(facecolor=BG, edgecolor=GRID, labelcolor=FG, loc='upper left')
    for i, v in enumerate(REVENUE_Q):
        ax.text(i - w/2, v+max(REVENUE_Q)*0.02, f'{v:.1f}', ha='center', color=FG, fontsize=9)
    for i, v in enumerate(NET_INCOME_Q):
        ax.text(i + w/2, v+max(REVENUE_Q)*0.02, f'{v:.1f}', ha='center', color=FG, fontsize=9)
    plt.tight_layout()
    plt.savefig('chart_revenue.png', facecolor=BG)
    plt.close()


def make_marketcap():
    fig, ax = plt.subplots(figsize=(9.5,5), dpi=160)
    style_ax(ax)
    x = range(len(MC_LABELS))
    ax.bar(x, MARKETCAP_USD_B, color=ACCENT1, width=0.45)
    ax.set_xticks(list(x))
    ax.set_xticklabels(MC_LABELS, fontsize=10)
    ax.set_ylabel('시가총액 (10억 달러)')
    ax.set_title(f'{COMPANY} 시가총액 — 화이트리스트 확인 이정표', fontsize=13, pad=14)
    for i, u in enumerate(MARKETCAP_USD_B):
        ax.text(i, u+max(MARKETCAP_USD_B)*0.02, f'${u:,}B', ha='center', color=FG, fontsize=10)
    plt.tight_layout()
    plt.savefig('chart_marketcap.png', facecolor=BG)
    plt.close()


def make_stockprice():
    fig, ax = plt.subplots(figsize=(9.5,5), dpi=160)
    style_ax(ax)
    x = range(len(SP_LABELS))
    ax.plot(x, STOCK_PRICE, color=ACCENT2, marker='o', linewidth=2.5)
    ax.fill_between(x, STOCK_PRICE, color=ACCENT2, alpha=0.12)
    ax.set_xticks(list(x))
    ax.set_xticklabels(SP_LABELS, fontsize=10)
    ax.set_ylabel('주가 (달러)')
    ax.set_title(f'{COMPANY} 주가 — 사상 최고가와 최근 종가', fontsize=13, pad=14)
    for i, v in enumerate(STOCK_PRICE):
        ax.text(i, v+max(STOCK_PRICE)*0.025, f'${v:,.2f}', ha='center', color=FG, fontsize=9)
    plt.tight_layout()
    plt.savefig('chart_stockprice.png', facecolor=BG)
    plt.close()


def make_revenue_mix():
    fig, ax = plt.subplots(figsize=(11.5,7.5), dpi=160)
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    colors = MIX_COLORS[:len(MIX_LABELS)]
    wedges, _ = ax.pie(
        MIX_PCT, colors=colors, startangle=90, counterclock=False,
        wedgeprops=dict(width=0.42, edgecolor=BG, linewidth=3),
        radius=1.0,
    )
    ax.text(0, 0.06, f'{MIX_YEAR_LABEL[:14]}...', ha='center', va='center', color=MUTED, fontsize=10)
    ax.text(0, -0.08, MIX_TOTAL_LABEL, ha='center', va='center', color=FG, fontsize=19, fontweight='bold')
    cum = 0
    for p in MIX_PCT:
        ang = np.deg2rad(90 - (cum + p/2) * 3.6)
        cum += p
        x, y = 0.79*np.cos(ang), 0.79*np.sin(ang)
        ax.text(x, y, f'{p}%', ha='center', va='center', color=BG, fontsize=12.5, fontweight='bold')
    ax.set_aspect('equal')
    legend_lines = [f'{lab}   {p}%  ·  ${u}B' for lab, p, u in zip(MIX_LABELS, MIX_PCT, MIX_USD_B)]
    ax.legend(wedges, legend_lines, loc='center left', bbox_to_anchor=(1.05, 0.5),
              frameon=False, labelcolor=FG, fontsize=12.5, handlelength=1.4,
              handleheight=1.4, borderpad=0.6, labelspacing=1.1)
    plt.title(f'{COMPANY} 매출 구성 (2025년 7~9월 분기)', color=FG, fontsize=16, pad=18, x=0.32)
    plt.subplots_adjust(left=0.02, right=0.54, top=0.88, bottom=0.06)
    plt.savefig('chart_revenue_mix.png', facecolor=BG)
    plt.close()


def make_timeline():
    n = len(TIMELINE_EVENTS)
    figwidth = max(18, n * 1.9)
    fig, ax = plt.subplots(figsize=(figwidth, 7.2), dpi=160)
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    xs = list(range(n))
    ax.axhline(0, color=GRID, linewidth=3, zorder=1)
    for x, (year, title, side, kind) in zip(xs, TIMELINE_EVENTS):
        dot_color = HW if kind == 'hw' else SVC
        ax.scatter([x], [0], s=320, color=dot_color, zorder=3, edgecolor=BG, linewidth=3)
        y_text = 0.32 if side > 0 else -0.32
        va = 'bottom' if side > 0 else 'top'
        ax.plot([x, x], [0, y_text*0.55], color=GRID, linewidth=2.5, zorder=2)
        ax.text(x, y_text, f'{year}', ha='center', va=va, color=FG, fontsize=34, fontweight='bold')
        y_title = y_text + (0.20 if side > 0 else -0.20)
        ax.text(x, y_title, title, ha='center', va=va, color=dot_color, fontsize=27, fontweight='bold')
    ax.scatter([0.3], [1.05], s=320, color=HW, zorder=3)
    ax.text(0.6, 1.05, '하드웨어', color=FG, fontsize=25, va='center')
    ax.scatter([2.6], [1.05], s=320, color=SVC, zorder=3)
    ax.text(2.9, 1.05, '서비스', color=FG, fontsize=25, va='center')
    ax.set_xlim(-0.6, n-0.4)
    ax.set_ylim(-1.05, 1.25)
    ax.axis('off')
    plt.title(f'{COMPANY} 하드웨어·서비스 통합 타임라인 ({TIMELINE_YEAR_RANGE})', color=FG, fontsize=34, pad=20)
    plt.tight_layout()
    plt.savefig('chart_timeline.png', facecolor=BG)
    plt.close()


if __name__ == '__main__':
    make_revenue_income()
    make_marketcap()
    make_stockprice()
    make_revenue_mix()
    make_timeline()
    print('5 charts generated: chart_revenue.png, chart_marketcap.png, chart_stockprice.png, chart_revenue_mix.png, chart_timeline.png')
