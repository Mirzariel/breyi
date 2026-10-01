"""Simulasi representatif respons frekuensi microgrid pulau (model agregat satu bus).

BUKAN model Nusa Penida tervalidasi. Seluruh parameter sistem pada PARAM adalah
asumsi representatif. Tujuan: membandingkan kasus pada perangkat keras identik
yang hanya berbeda pada batas injeksi bersih hasil skema alokasi daya antarmodul
(dihitung statis di Lampiran C naskah):
  - Tanpa VI
  - VI alokasi rata konservatif   : 72,737 kW
  - VI alokasi rata + clip lokal  : 92,211 kW
  - VI alokasi adaptif SOP        : 100 kW (layanan; headroom 105,26 kW)

Model:  M d(df)/dt = Pm + Pvi - dP - D*df,  M = 2*H*S/f0
Governor diesel: droop R dengan satu lag ekuivalen T_gov (model LFC satu area), plus integral sekunder.
VI: P = -Kv*RoCoF_terfilter - Kd*df, latency murni, loop arus inverter orde-1,
saturasi [0, cap], serah-terima ramp turun linier 10->15 s setelah gangguan.
"""
import json
import sys
import numpy as np

PARAM = dict(
    f0=50.0,      # Hz
    S_sync=3.0,   # MVA diesel online (asumsi)
    H=1.5,        # s inersia diesel (asumsi; tipikal 0,5-2 s)
    P_load=2.5,   # MW beban saat kejadian (asumsi)
    D_pu=1.0,     # %dP beban per %df (asumsi)
    R_gov=0.05,   # droop governor
    T_gov=0.5,    # s, lag ekuivalen governor+mesin diesel (asumsi)
    Ki_sec=0.05,  # MW/(Hz.s), kendali sekunder lambat
    Kv=0.080,     # MW.s/Hz  (= 2*Hv*Sb/f0; Hv = 2 s, Sb = 1 MW)
    Kd=0.300,     # MW/Hz
    T_f=0.05,     # s filter RoCoF
    delay=0.10,   # s latency deteksi-injeksi (target uji)
    T_inv=0.02,   # s loop arus inverter
)
CAPS = {
    "Tanpa VI": 0.0,
    "VI rata konservatif": 0.072737,
    "VI rata + clip lokal": 0.092211,
    "VI adaptif SOP": 0.100,
}
T_DIST = 1.0


def simulate(cap, dP=0.25, t_end=25.0, dt=1e-3, p=PARAM):
    f0 = p["f0"]
    M = 2 * p["H"] * p["S_sync"] / f0
    D = p["D_pu"] * p["P_load"] / f0
    Kg = p["S_sync"] / (p["R_gov"] * f0)
    n = int(round(t_end / dt)) + 1
    t = np.arange(n) * dt
    df = np.zeros(n); pvi = np.zeros(n)
    xm = sec = rocof_f = pv = 0.0
    buf = [0.0] * int(round(p["delay"] / dt))
    for k in range(1, n):
        dist = dP if t[k] >= T_DIST else 0.0
        dfdt = (xm + pv - dist - D * df[k - 1]) / M
        df[k] = df[k - 1] + dt * dfdt
        rocof_f += dt / p["T_f"] * (dfdt - rocof_f)
        buf.append(-p["Kv"] * rocof_f - p["Kd"] * df[k])
        cmd = buf.pop(0)
        te = t[k] - T_DIST
        ramp = 1.0 if te < 10 else max(0.0, 1 - (te - 10) / 5)
        cmd = min(max(cmd, 0.0), cap * ramp)
        pv += dt / p["T_inv"] * (cmd - pv)
        sec += dt * (-p["Ki_sec"] * df[k])
        xm += dt / p["T_gov"] * (-Kg * df[k] + sec - xm)
        pvi[k] = pv
    return t, df, pvi


def metrics(t, df, pvi, dt=1e-3):
    i0 = int(round(T_DIST / dt)); w = int(round(0.5 / dt))
    f = 50 + df
    return dict(
        nadir_Hz=round(float(f.min()), 3),
        t_nadir_s=round(float(t[f.argmin()] - T_DIST), 2),
        rocof_500ms=round(float((f[i0 + w] - f[i0]) / 0.5), 3),
        P_puncak_kW=round(float(pvi.max() * 1000), 1),
        E_kWh=round(float(np.sum(pvi) * dt / 3.6), 4),  # MW*s -> kWh: /3.6
        f_min_setelah_serah_terima=round(float(f[int(11 / dt):].min()), 3),
    )


def run_all():
    res = {}
    for dP in (0.15, 0.25):
        res[f"{int(dP*1000)} kW"] = {nm: metrics(*simulate(c, dP=dP)) for nm, c in CAPS.items()}
    sens = {}
    for H in (1.0, 1.5, 2.0):
        p = dict(PARAM, H=H)
        sens[f"H={H}"] = {nm: metrics(*simulate(c, dP=0.25, p=p))
                          for nm, c in CAPS.items() if nm in ("Tanpa VI", "VI rata + clip lokal", "VI adaptif SOP")}
    return res, sens


def plot(outfile):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams.update({"font.family": "serif", "font.serif": ["Times New Roman"],
                         "font.size": 9})
    colors = {"Tanpa VI": "#888888", "VI rata konservatif": "#d08c2c",
              "VI rata + clip lokal": "#3b7dd8", "VI adaptif SOP": "#1a8a4a"}
    styles = {"Tanpa VI": ":", "VI rata konservatif": "-.", "VI rata + clip lokal": "--", "VI adaptif SOP": "-"}
    fig, ax = plt.subplots(1, 2, figsize=(6.9, 2.5))
    for nm, c in CAPS.items():
        t, df, pvi = simulate(c, dP=0.25)
        ax[0].plot(t - T_DIST, 50 + df, styles[nm], color=colors[nm], lw=1.3, label=nm)
        ax[1].plot(t - T_DIST, pvi * 1000, styles[nm], color=colors[nm], lw=1.3)
    ax[0].set(xlim=(-0.5, 20), ylim=(49.55, 50.03), xlabel="Waktu setelah gangguan (s)", ylabel="Frekuensi (Hz)")
    ax[1].set(xlim=(-0.5, 20), ylim=(-5, 110), xlabel="Waktu setelah gangguan (s)", ylabel="Injeksi VI (kW)")
    ax[0].legend(fontsize=7, loc="lower right", frameon=False)
    for a in ax:
        a.grid(alpha=0.3, lw=0.5)
    fig.tight_layout()
    fig.savefig(outfile, dpi=300)


if __name__ == "__main__":
    res, sens = run_all()
    print(json.dumps({"hasil": res, "sensitivitas_H": sens, "param": PARAM}, indent=1, ensure_ascii=False))
    if len(sys.argv) > 1:
        plot(sys.argv[1])
