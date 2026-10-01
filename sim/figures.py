"""Grafik naskah dan data untuk website. Jalankan: python3 figures.py"""
import json
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import sim_frekuensi as s

OUT = os.path.join(os.path.dirname(__file__), "..", "figures")
C = dict(ink="#262c31", grid="#e3e6e4", base="#8a949a", trip="#c8553d", clip="#d9952b",
         cons="#c9b98f", revia="#0f8f84")
plt.rcParams.update({
    "font.family": "serif", "font.serif": ["Times New Roman"], "mathtext.fontset": "stix",
    "font.size": 9, "axes.labelsize": 9, "xtick.labelsize": 8.5, "ytick.labelsize": 8.5,
    "axes.edgecolor": C["ink"], "axes.linewidth": 0.6, "xtick.major.width": 0.6, "ytick.major.width": 0.6,
    "xtick.color": C["ink"], "ytick.color": C["ink"], "axes.labelcolor": C["ink"],
    "axes.spines.top": False, "axes.spines.right": False, "savefig.bbox": "tight", "savefig.pad_inches": 0.02,
})
COLW = 3.25  # inci, lebar satu kolom
from matplotlib.ticker import FuncFormatter
KOMA = FuncFormatter(lambda v, _: (f"{v:g}" if abs(v) >= 1e-9 else "0").replace(".", ","))


def koma(ax):
    ax.xaxis.set_major_formatter(KOMA); ax.yaxis.set_major_formatter(KOMA)

SOP_A, SOP_B = 5.072, 3.150
SUM_SOP = 20 * SOP_A + 8 * SOP_B


def cases(dP=0.25):
    out = {}
    out["Tanpa VI"] = s.simulate(0.0, dP)
    log = []
    out["Rata tanpa SOP"] = s.simulate(0.1, dP, equal_trip=True, log=log)
    trips = list(s.simulate.trips)
    out["Rata + clip"] = s.simulate(0.092211, dP)
    out["Rata konservatif"] = s.simulate(0.072737, dP)
    out["ReVIA (adaptif SOP)"] = s.simulate(0.1, dP)
    return out, log, trips


def revia_currents(pv):
    pt = pv * 1000 / 0.94 + 2.0
    pt[pv <= 1e-6] = 0
    pa, pb = pt * SOP_A / SUM_SOP, pt * SOP_B / SUM_SOP
    ia = (130 - np.sqrt(130 ** 2 - 4 * 0.08 * pa * 1000)) / 0.16
    ib = (130 - np.sqrt(130 ** 2 - 4 * 0.16 * pb * 1000)) / 0.32
    return ia, ib


def fig_frekuensi(res):
    fig, ax = plt.subplots(2, 1, figsize=(COLW, 2.6), sharex=True, gridspec_kw=dict(hspace=0.12))
    order = [("Tanpa VI", C["base"], (0, (1.2, 1.4)), 1.1), ("Rata tanpa SOP", C["trip"], "-", 1.0),
             ("Rata + clip", C["clip"], (0, (4, 1.5)), 1.0), ("ReVIA (adaptif SOP)", C["revia"], "-", 1.8)]
    for nm, col, ls, lw in order:
        t, df, pv = res[nm]
        ax[0].plot(t - 1, 50 + df, color=col, ls=ls, lw=lw)
        ax[1].plot(t - 1, pv * 1000, color=col, ls=ls, lw=lw)
    ax[0].set(ylim=(49.56, 50.02), xlim=(-0.3, 6), ylabel="Frekuensi (Hz)")
    ax[1].set(ylim=(-4, 108), ylabel="Injeksi (kW)", xlabel="Waktu setelah gangguan (s)")
    for a in ax:
        a.yaxis.grid(True, color=C["grid"], lw=0.6); a.set_axisbelow(True)
    lab = dict(fontsize=8)
    ax[0].text(0.62, 49.585, "tanpa VI  49,597 Hz", color=C["base"], **lab)
    ax[0].text(2.1, 49.885, "adaptif SOP, nadir 49,734 Hz", color=C["revia"], weight="bold", **lab)
    ax[0].text(2.3, 49.70, "rata tanpa SOP:\nbank trip pada 0,26 s", color=C["trip"], **lab)
    ax[1].text(0.62, 96, "adaptif SOP 100 kW", color=C["revia"], weight="bold", **lab)
    ax[1].text(0.62, 84, "rata + pembatas 92 kW", color=C["clip"], **lab)
    ax[1].annotate("trip berantai", xy=(0.27, 30), xytext=(0.9, 18), color=C["trip"], fontsize=8,
                   arrowprops=dict(arrowstyle="-", color=C["trip"], lw=0.6))
    for a in ax:
        koma(a)
    ax[0].yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v:.1f}".replace(".", ",")))
    fig.align_ylabels(ax)
    fig.savefig(os.path.join(OUT, "fig_frekuensi.pdf"))
    fig.savefig(os.path.join(OUT, "fig_frekuensi.png"), dpi=300)


def fig_alokasi(res, log):
    fig, ax = plt.subplots(1, 2, figsize=(2 * COLW + 0.3, 2.05), gridspec_kw=dict(width_ratios=[1, 1.25], wspace=0.38))
    # (a) daya yang dapat dijanjikan
    names = ["Rata tanpa SOP", "Rata\nkonservatif", "Rata +\npembatas", "Adaptif SOP\n(usulan)"]
    vals = [0, 72.7, 92.2, 100.0]
    cols = [C["trip"], C["cons"], C["clip"], C["revia"]]
    y = np.arange(4)[::-1]
    ax[0].barh(y, vals, color=cols, height=0.58)
    for yi, v, nm in zip(y, vals, names):
        ax[0].text(v + 2 if v else 2, yi, "trip" if v == 0 else f"{v:.1f} kW".replace(".", ","),
                   va="center", fontsize=8.5, color=C["trip"] if v == 0 else C["ink"],
                   weight="bold" if "Adaptif" in nm else "normal")
    ax[0].set_yticks(y, names, fontsize=8.5)
    ax[0].set(xlim=(0, 118), xlabel="Layanan bersih yang aman (kW)")
    ax[0].tick_params(axis="y", length=0)
    ax[0].spines["left"].set_visible(False)
    ax[0].xaxis.grid(True, color=C["grid"], lw=0.6); ax[0].set_axisbelow(True)
    ax[0].set_title("(a)", loc="left", fontsize=9)
    # (b) arus modul
    lg = np.array(log)
    t, df, pv = res["ReVIA (adaptif SOP)"]
    ia, ib = revia_currents(pv)
    ax[1].axhline(40, color=C["ink"], lw=0.6, ls=(0, (2, 2)))
    ax[1].axhline(25, color=C["ink"], lw=0.6, ls=(0, (2, 2)))
    ax[1].text(1.52, 41, "batas A 40 A", fontsize=7.5, color=C["ink"])
    ax[1].text(1.52, 26, "batas B 25 A", fontsize=7.5, color=C["ink"])
    tl = lg[:, 0] - 1
    ax[1].plot(tl, lg[:, 1], color=C["trip"], lw=1.0, ls=(0, (4, 1.5)))
    ax[1].plot(tl, lg[:, 2], color=C["trip"], lw=1.0)
    ax[1].plot(t - 1, ia, color=C["revia"], lw=1.6, ls=(0, (4, 1.5)))
    ax[1].plot(t - 1, ib, color=C["revia"], lw=1.6)
    ax[1].text(1.45, 17.3, "adaptif, modul A (- -)", fontsize=7.5, color=C["revia"])
    ax[1].text(1.45, 5.0, "adaptif, modul B (—)", fontsize=7.5, color=C["revia"])
    ax[1].text(0.3, 45.6, "rata tanpa SOP: B trip 0,21 s, A trip 0,26 s", fontsize=7.5, color=C["trip"])
    ax[1].set(xlim=(0, 2.2), ylim=(0, 49), xlabel="Waktu setelah gangguan (s)", ylabel="Arus per modul (A)")
    ax[1].yaxis.grid(True, color=C["grid"], lw=0.6); ax[1].set_axisbelow(True)
    ax[1].set_title("(b)", loc="left", fontsize=9)
    ax[0].xaxis.set_major_formatter(KOMA); koma(ax[1])
    fig.savefig(os.path.join(OUT, "fig_alokasi.pdf"))
    fig.savefig(os.path.join(OUT, "fig_alokasi.png"), dpi=300)


def export_json(res, log, trips):
    data = {"dt": 0.01, "t": [], "cases": {}, "trips": [[float(a), b] for a, b in trips]}
    for nm, (t, df, pv) in res.items():
        idx = slice(0, int(21 / 1e-3) + 1, 10)
        data["t"] = [round(float(x - 1), 3) for x in t[idx]]
        data["cases"][nm] = {"f": [round(float(50 + x), 4) for x in df[idx]],
                             "p_kw": [round(float(x * 1000), 2) for x in pv[idx]],
                             "metrik": s.metrics(t, df, pv)}
    with open(os.path.join(OUT, "data_simulasi.json"), "w") as fh:
        json.dump(data, fh, ensure_ascii=False)


if __name__ == "__main__":
    res, log, trips = cases()
    fig_frekuensi(res)
    fig_alokasi(res, log)
    export_json(res, log, trips)
    for nm, (t, df, pv) in res.items():
        print(nm, s.metrics(t, df, pv))
    print("trips", trips)
