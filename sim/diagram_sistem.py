"""Diagram blok sistem bank second-life EV untuk virtual inertia adaptif."""
import sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman"], "mathtext.fontset": "stix", "mathtext.rm": "Times New Roman"})
C = dict(bat="#e7f3ea", batE="#1a8a4a", pe="#e8f0fb", peE="#2c62b5", ctl="#fff4e0", ctlE="#c27a10",
         grid="#f1f1f1", gridE="#555555")


def box(ax, x, y, w, h, text, fc, ec, fs=8.5, bold=False):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.08",
                                fc=fc, ec=ec, lw=1.2))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fs,
            weight="bold" if bold else "normal", linespacing=1.15 if "\n$" not in text else 1.7)


def arrow(ax, x1, y1, x2, y2, color="#333", style="-|>", ls="-", lw=1.2):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw, ls=ls, shrinkA=0, shrinkB=0))


def draw(outfile):
    fig, ax = plt.subplots(figsize=(10, 5.6))
    ax.set_xlim(0, 10); ax.set_ylim(0, 5.6); ax.axis("off")
    # modul baterai
    ys = [4.25, 3.35, 1.65]
    labels = ["Modul 1 (kelas A)\nNMC/HC 36s2p", "Modul 2 (kelas A)", "Modul 28 (kelas B)"]
    for y, lb in zip(ys, labels):
        box(ax, 0.2, y, 1.65, 0.7, lb, C["bat"], C["batE"], fs=8)
        box(ax, 2.05, y, 0.75, 0.7, "BMS\nlokal", C["bat"], C["batE"], fs=8)
        box(ax, 3.05, y, 1.1, 0.7, "DC/DC\nbidireksional\nterisolasi", C["pe"], C["peE"], fs=7.5)
        arrow(ax, 1.85, y + 0.35, 2.05, y + 0.35, style="-")
        arrow(ax, 2.8, y + 0.35, 3.05, y + 0.35, style="<|-|>")
        arrow(ax, 4.15, y + 0.35, 4.55, y + 0.35, style="<|-|>")
    ax.text(1.0, 2.75, "· · ·", fontsize=14, rotation=90, ha="center", va="center")
    ax.text(3.6, 2.75, "· · ·", fontsize=14, rotation=90, ha="center", va="center")
    # DC bus
    ax.plot([4.55, 4.55], [1.75, 4.85], color=C["peE"], lw=4)
    ax.text(4.55, 5.05, "Bus DC\n750 V", ha="center", fontsize=8.5, color=C["peE"], weight="bold")
    arrow(ax, 4.55, 3.3, 5.05, 3.3, style="<|-|>")
    box(ax, 5.05, 2.85, 1.25, 0.9, "Inverter 3 fase\n125 kVA\n(grid-following)", C["pe"], C["peE"], fs=8)
    arrow(ax, 6.3, 3.3, 6.65, 3.3, style="<|-|>")
    box(ax, 6.65, 2.85, 1.1, 0.9, "Filter +\ntrafo\n0,4/20 kV", C["pe"], C["peE"], fs=8)
    arrow(ax, 7.75, 3.3, 8.1, 3.3, style="<|-|>")
    box(ax, 8.1, 2.4, 1.75, 1.8, "Microgrid\nNusa Penida\nPLTS 3,5 MWp\nBESS 1,8 MWh\nPLTD diesel", C["grid"], C["gridE"], fs=8)
    # pengendali
    box(ax, 4.9, 0.12, 3.0, 1.4,
        "Pengendali VI adaptif\n$P_{cmd}=-\\lambda K_{v}\\,\\widehat{df/dt}-\\lambda K_{d}\\,\\Delta f$\n"
        "$p_i = P\\cdot SOP_i/\\Sigma SOP$  (redistribusi + anti-windup)",
        C["ctl"], C["ctlE"], fs=8)
    arrow(ax, 8.95, 2.4, 7.9, 0.95, color=C["ctlE"], ls="--")
    ax.text(8.75, 1.45, "f, RoCoF\n(PCC)", fontsize=7.5, color=C["ctlE"], ha="left")
    arrow(ax, 5.68, 1.4, 5.68, 2.85, color=C["ctlE"], ls="--")
    ax.text(5.75, 2.1, "P*", fontsize=8, color=C["ctlE"])
    # SOP info dari BMS
    ax.plot([2.42, 2.42], [1.65, 0.82], color=C["ctlE"], ls="--", lw=1.1)
    arrow(ax, 2.42, 0.82, 4.9, 0.82, color=C["ctlE"], ls="--")
    ax.text(3.72, 0.92, "SOC, V, I, T, R → SOP$_i$", fontsize=7.5, color=C["ctlE"])
    arrow(ax, 4.9, 0.55, 3.6, 0.55, color=C["ctlE"], ls="--")
    ax.plot([3.6, 3.6], [0.55, 1.65], color=C["ctlE"], ls="--", lw=1.1)
    ax.text(3.68, 0.3, "$p_i^*$ ke tiap DC/DC", fontsize=7.5, color=C["ctlE"])
    ax.text(0.2, 5.35, "Bank Second-Life EV untuk Virtual Inertia Adaptif — 28 modul, layanan 100 kW / 10 s",
            fontsize=11, weight="bold")
    fig.tight_layout()
    fig.savefig(outfile, dpi=300)
    if outfile.endswith(".png"):
        fig.savefig(outfile[:-4] + ".pdf")


if __name__ == "__main__":
    draw(sys.argv[1])
