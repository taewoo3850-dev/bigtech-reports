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
COMPANY = '애플'

# 1) 10년 매출·순이익 (10억 달러 단위, 회계연도(9월 결산) 기준)
# 출처: 애플 SEC 10-K/8-K 공식 실적공시. FY2025 수치는 국내 보도로 교차 확인
# (글로벌이코노믹 2025-10-31, https://www.g-enews.com/article/Global-Biz/2025/10/2025103106513834113bc914ac71_1)
YEARS_FIN = [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025]
REVENUE = [215.64,229.23,265.60,260.17,274.52,365.82,394.33,383.29,391.04,416.16]
NET_INCOME = [45.687,48.351,59.531,55.256,57.411,94.680,99.803,96.995,93.736,112.010]

# 2) 시가총액 — 정확한 "연말 종가" 전체 시계열은 국내 언론에서 확인하지 못해,
#    실제로 국내 매체가 보도한 시가총액 이정표(돌파 시점)를 날짜와 함께 사용.
#    (라벨에 연도 대신 실제 보도 일자 표기)
MC_LABELS = ['2018.8.2\n1조$ 돌파', '2020.8.19\n2조$ 돌파', '2023.6.30\n3조$ 돌파',
             '2025.10.28\n4조$ 돌파', '2026.7.28\n5조$ 돌파(최고)']
MARKETCAP_USD_B = [1000, 2000, 3051, 4000, 5036]
MARKETCAP_KRW_TRILLION = [1129, None, None, None, None]  # 확인된 원화환산 보도가 있는 시점만 표기
MARKETCAP_SOURCE = ('출처: 머니투데이(2018.8.5, m.mt.co.kr/2018080515192781918) · '
                     '아시아경제(2020.8.19 관련) · 경향신문(2023.7.2, khan.co.kr/202307021544001) · '
                     '다음뉴스(2025.10.29, v.daum.net/20251029025112222) · '
                     '뉴스핌(2026.7.29, newspim.com/20260729000005). '
                     '2026.8.19 서울외환시장 환율 1,397.7원(머니투데이) 적용 시 현재 시총 약 6,300조원 수준(직접 환산).')

# 3) 주가 — 마찬가지로 "매년 12월 말 종가" 전체 시계열은 국내 언론 확인 불가.
#    5차례 분할(1987·2000·2005·2014 7:1·2020 4:1)이 모두 반영된 분할조정가 기준,
#    국내 매체가 실제 보도한 시점들만 사용.
SP_LABELS = ['2020.8.31\n(4:1분할 직전)', '2020.8.31\n(4:1분할 후)', '2025.10.28\n(4조$ 돌파 시)',
             '2026.7.28\n(사상 최고가)', '2026.8.1\n(실적발표 후 급락)', '2026.8.17\n(최근 종가)']
STOCK_PRICE = [384.76, 96.19, 269.32, 342.89, 308.91, 305.12]
STOCK_PRICE_SOURCE = ('출처: 아시아경제(2020.7.31, asiae.co.kr/2020073107243986435, 분할 내역) · '
                       '다음뉴스(2025.10.29) · 뉴스핌(2026.7.29, 사상 최고가) · '
                       '뉴스웨이(2026.8.1, newsway.co.kr/news/view?ud=2026080111263433986, 실적발표 후 7.35% 급락) · '
                       '이데일리(2026.8.17, TODAY애플 코너 종가 기준)')

# 4) 매출 구성 (FY2025, 2025년 10월 30일 발표) — 출처: 글로벌이코노믹, 초이스스탁US
MIX_LABELS = ['아이폰', '서비스', '웨어러블·홈·액세서리', '맥', '아이패드']
MIX_PCT =    [50.4,      26.2,     8.6,                  7.9,   6.9]
MIX_USD_B =  [209.8,     109.0,    35.7,                 32.9,  28.8]
MIX_YEAR_LABEL = '2025년 10월 30일 발표'
MIX_TOTAL_LABEL = '$416.2B'

# 5) 하드웨어·서비스 통합 타임라인 — (연도, 이름, 방향 1=위/-1=아래, 'hw' 또는 'svc')
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
    (2026, 'CEO 교체', 1, 'hw'),
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
    x = range(len(YEARS_FIN))
    ax.bar(x, REVENUE, color=ACCENT1, width=0.55, label='매출')
    ax.plot(x, NET_INCOME, color=ACCENT2, marker='o', linewidth=2.5, label='순이익')
    ax.set_xticks(list(x))
    ax.set_xticklabels([f'{y}년' for y in YEARS_FIN])
    ax.set_ylabel('10억 달러')
    ax.set_title(f'{COMPANY} 매출·순이익 추이 ({YEARS_FIN[0]}~{YEARS_FIN[-1]}년, 회계연도 기준)', fontsize=13, pad=14)
    ax.legend(facecolor=BG, edgecolor=GRID, labelcolor=FG, loc='upper left')
    for i, v in enumerate(REVENUE):
        ax.text(i, v+max(REVENUE)*0.02, f'{v:.0f}', ha='center', color=FG, fontsize=8)
    plt.tight_layout()
    plt.savefig('chart_revenue.png', facecolor=BG)
    plt.close()


def make_marketcap():
    fig, ax = plt.subplots(figsize=(9.5,5), dpi=160)
    style_ax(ax)
    x = range(len(MC_LABELS))
    ax.bar(x, MARKETCAP_USD_B, color=ACCENT1, width=0.55)
    ax.set_xticks(list(x))
    ax.set_xticklabels(MC_LABELS, fontsize=9)
    ax.set_ylabel('시가총액 (10억 달러)')
    ax.set_title(f'{COMPANY} 시가총액 주요 이정표 (보도 시점 기준)', fontsize=13, pad=14)
    for i, u in enumerate(MARKETCAP_USD_B):
        ax.text(i, u+max(MARKETCAP_USD_B)*0.02, f'${u:,}B', ha='center', color=FG, fontsize=9)
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
    ax.set_xticklabels(SP_LABELS, fontsize=9)
    ax.set_ylabel('주가 (달러, 분할조정 기준)')
    ax.set_title(f'{COMPANY} 주가 주요 시점 (분할조정 반영, 보도 시점 기준)', fontsize=13, pad=14)
    for i, v in enumerate(STOCK_PRICE):
        ax.text(i, v+max(STOCK_PRICE)*0.025, f'${v:,.2f}', ha='center', color=FG, fontsize=8)
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
    ax.text(0, 0.06, f'{MIX_YEAR_LABEL} 총매출', ha='center', va='center', color=MUTED, fontsize=11)
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
    plt.title(f'{COMPANY} 매출 구성 ({MIX_YEAR_LABEL})', color=FG, fontsize=16, pad=18, x=0.32)
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
