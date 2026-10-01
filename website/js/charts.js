// Grafik SVG tangan: tanpa pustaka. Data dari data/data_simulasi.json.
const NS = 'http://www.w3.org/2000/svg';
const C = { ink: '#262c31', teal: '#0f8f84', amber: '#e8a33d', amberInk: '#8f5f10', grid: '#e3e6e4', axis: '#c3cac6', muted: '#5d686e', ref: '#a3acb1', red: '#c4452e' };
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const fmt = (n, d = 3) => Number(n).toFixed(d).replace('.', ',').replace('-', '\u2212');

function s(tag, attrs = {}, parent, text) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (text != null) el.textContent = text;
  if (parent) parent.appendChild(el);
  return el;
}

function pathD(xs, ys, t, v, i0, i1, step = 1) {
  let d = '';
  for (let i = i0; i <= i1; i += step) d += (d ? 'L' : 'M') + xs(t[i]).toFixed(1) + ' ' + ys(v[i]).toFixed(1);
  if ((i1 - i0) % step) d += 'L' + xs(t[i1]).toFixed(1) + ' ' + ys(v[i1]).toFixed(1);
  return d;
}

// gambar garis dengan animasi "menulis"; played=false menyembunyikan dulu
function prepDraw(path, played) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = played ? 0 : len;
  path._len = len;
}
function playDraw(path, ms = 1500, delay = 0) {
  if (!path || path._len == null) return;
  if (reduced()) { path.style.strokeDashoffset = 0; return; }
  path.getBoundingClientRect();
  path.style.transition = `stroke-dashoffset ${ms}ms cubic-bezier(.4,.1,.2,1) ${delay}ms`;
  path.style.strokeDashoffset = 0;
}

const idx = (d, t) => Math.round((t - d.t[0]) / d.dt);

/* ------------------------------------------------------------------ */
/* Grafik 1: frekuensi, tanpa VI vs ReVIA                              */
/* ------------------------------------------------------------------ */
function problemChart(host, d, readout) {
  const A = d.cases['Tanpa VI'], R = d.cases['ReVIA (adaptif SOP)'];
  let played = false, paths = [];
  const x0 = -0.2, x1 = 3, y0 = 49.5, y1 = 50.02;

  const setReadout = (t, a, b) => {
    readout.querySelector('.r-t').textContent = 't = ' + fmt(t, 2) + ' s';
    readout.querySelector('.r-a b').textContent = fmt(a, 3) + ' Hz';
    readout.querySelector('.r-b b').textContent = fmt(b, 3) + ' Hz';
  };
  const defaultReadout = () => setReadout(A.metrik.t_nadir_s, A.metrik.nadir_Hz, R.f[idx(d, A.metrik.t_nadir_s)] ? R.metrik.nadir_Hz : R.metrik.nadir_Hz);

  function draw() {
    const W = host.clientWidth; if (!W) return;
    host.innerHTML = '';
    const small = W < 520, H = small ? 300 : 380;
    const m = { l: small ? 40 : 46, r: 14, t: 28, b: 30 };
    const X = (t) => m.l + (t - x0) / (x1 - x0) * (W - m.l - m.r);
    const Y = (f) => m.t + (y1 - f) / (y1 - y0) * (H - m.t - m.b);
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, 'aria-hidden': 'true' }, host);

    // gridlines & sumbu y
    [49.6, 49.7, 49.8, 49.9, 50.0].forEach((v) => {
      s('line', { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: v === 50 ? C.axis : C.grid, 'stroke-width': 1 }, svg);
      s('text', { x: m.l - 8, y: Y(v) + 4, 'text-anchor': 'end' }, svg, fmt(v, 1));
    });
    s('text', { x: m.l - 8, y: 12, 'text-anchor': 'end' }, svg, 'Hz');
    s('text', { x: W - m.r, y: Y(50) - 7, 'text-anchor': 'end' }, svg, 'frekuensi nominal');
    // sumbu x
    [0, 1, 2, 3].forEach((v) => {
      s('line', { x1: X(v), x2: X(v), y1: H - m.b, y2: H - m.b + 5, stroke: C.axis }, svg);
      s('text', { x: X(v), y: H - 8, 'text-anchor': v === 3 ? 'end' : 'middle' }, svg, v + ' s');
    });
    s('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: C.axis }, svg);
    // penanda gangguan
    s('line', { x1: X(0), x2: X(0), y1: m.t - 4, y2: H - m.b, stroke: C.ink, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: .5 }, svg);
    s('text', { x: X(0) + 6, y: 11, 'text-anchor': 'start' }, svg, 'gangguan 250 kW, t = 0');

    const i0 = idx(d, x0), i1 = idx(d, x1);
    const pA = s('path', { d: pathD(X, Y, d.t, A.f, i0, i1), fill: 'none', stroke: C.ink, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, svg);
    const pR = s('path', { d: pathD(X, Y, d.t, R.f, i0, i1), fill: 'none', stroke: C.teal, 'stroke-width': 2.25, 'stroke-linejoin': 'round' }, svg);
    paths = [pA, pR];
    paths.forEach((p) => prepDraw(p, played));

    // nadir
    const nA = A.metrik, nR = R.metrik;
    const gN = s('g', { class: 'nadirs', opacity: played ? 1 : 0, style: 'transition: opacity .5s 1.3s' }, svg);
    s('circle', { cx: X(nA.t_nadir_s), cy: Y(nA.nadir_Hz), r: 4.5, fill: '#fff', stroke: C.ink, 'stroke-width': 1.5 }, gN);
    s('circle', { cx: X(nR.t_nadir_s), cy: Y(nR.nadir_Hz), r: 4.5, fill: '#fff', stroke: C.teal, 'stroke-width': 2 }, gN);
    const ax = X(nA.t_nadir_s), ay = Y(nA.nadir_Hz);
    s('text', { x: ax, y: ay + 22, class: 'lbl', 'text-anchor': 'middle', style: `fill:${C.ink}` }, gN, 'Tanpa VI');
    s('text', { x: ax, y: ay + 36, class: 'lbl-s', 'text-anchor': 'middle' }, gN, 'nadir ' + fmt(nA.nadir_Hz) + ' Hz');
    const rx = X(0.72), ry = Y(49.972);
    s('line', { x1: X(nR.t_nadir_s) + 3, y1: Y(nR.nadir_Hz) - 5, x2: rx - 6, y2: ry + 17, stroke: C.teal, 'stroke-width': 1 }, gN);
    s('text', { x: rx, y: ry, class: 'lbl', style: `fill:${C.teal}` }, gN, 'ReVIA');
    s('text', { x: rx, y: ry + 14, class: 'lbl-s' }, gN, 'nadir ' + fmt(nR.nadir_Hz) + ' Hz');
    host._nadirs = gN;

    // pemindai pointer
    const cross = s('g', { opacity: 0 }, svg);
    const cl = s('line', { y1: m.t - 4, y2: H - m.b, stroke: C.ink, 'stroke-width': 1 }, cross);
    const ca = s('circle', { r: 4, fill: C.ink }, cross);
    const cr = s('circle', { r: 4.5, fill: C.teal }, cross);
    const hit = s('rect', { x: m.l, y: 0, width: W - m.l - m.r, height: H - m.b, fill: 'transparent', style: 'cursor:crosshair' }, svg);
    const move = (ev) => {
      const r = svg.getBoundingClientRect();
      const px = (ev.clientX - r.left) * (W / r.width);
      const t = Math.max(x0, Math.min(x1, x0 + (px - m.l) / (W - m.l - m.r) * (x1 - x0)));
      const i = idx(d, t);
      cross.setAttribute('opacity', 1);
      cl.setAttribute('x1', X(t)); cl.setAttribute('x2', X(t));
      ca.setAttribute('cx', X(t)); ca.setAttribute('cy', Y(A.f[i]));
      cr.setAttribute('cx', X(t)); cr.setAttribute('cy', Y(R.f[i]));
      setReadout(d.t[i], A.f[i], R.f[i]);
    };
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerdown', move);
    hit.addEventListener('pointerleave', () => { cross.setAttribute('opacity', 0); defaultReadout(); });
  }

  draw();
  defaultReadout();
  new ResizeObserver(() => draw()).observe(host);
  return {
    play() {
      played = true;
      paths.forEach((p, i) => playDraw(p, 1500, i * 250));
      if (host._nadirs) host._nadirs.setAttribute('opacity', 1);
    },
  };
}

/* ------------------------------------------------------------------ */
/* Grafik 2: pilihan skema, frekuensi + daya injeksi                    */
/* ------------------------------------------------------------------ */
const CASES = [
  { k: 'Tanpa VI', label: 'Tanpa VI', color: 'ink' },
  { k: 'Rata tanpa SOP', label: 'Bagi rata tanpa SOP', color: 'amber' },
  { k: 'Rata konservatif', label: 'Bagi rata konservatif', color: 'ink' },
  { k: 'Rata + clip', label: 'Bagi rata + clip', color: 'ink' },
  { k: 'ReVIA (adaptif SOP)', label: 'ReVIA', color: 'teal' },
];

function casesChart(host, d, chipsEl, metricsEl) {
  const state = { k: 'ReVIA (adaptif SOP)', range: 3, played: false };
  const ref = d.cases['Tanpa VI'];
  const colorOf = (c) => ({ ink: C.ink, teal: C.teal, amber: C.amber }[c]);
  let animate = false;

  const cursor = document.createElement('div');
  cursor.className = 'cursor mono';
  cursor.style.cssText = 'font-size:12px;color:#5d686e;text-transform:none;letter-spacing:0;margin-bottom:6px;min-height:1.6em;font-variant-numeric:tabular-nums';
  const holder = document.createElement('div');
  host.appendChild(cursor); host.appendChild(holder);
  const idle = () => { cursor.textContent = 'Arahkan kursor ke grafik untuk membaca nilai'; };
  idle();

  function draw() {
    const W = host.clientWidth; if (!W) return;
    holder.innerHTML = '';
    const small = W < 520;
    const Hf = small ? 190 : 250, Hp = small ? 120 : 140, gap = small ? 40 : 46;
    const m = { l: small ? 40 : 46, r: 14, t: 16, b: 30 };
    const H = m.t + Hf + gap + Hp + m.b;
    const xmax = state.range;
    const X = (t) => m.l + (t - 0) / (xmax - 0) * (W - m.l - m.r);
    const f0 = 49.55, f1 = 50.02, yf0 = m.t, yf1 = m.t + Hf;
    const Yf = (f) => yf0 + (f1 - f) / (f1 - f0) * Hf;
    const p0 = 0, p1 = 115, yp0 = yf1 + gap, yp1 = yp0 + Hp;
    const Yp = (p) => yp1 - (p - p0) / (p1 - p0) * Hp;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, 'aria-hidden': 'true' }, holder);
    const cs = CASES.find((c) => c.k === state.k), col = colorOf(cs.color);
    const D = d.cases[state.k];

    // sumbu f
    (small ? [49.6, 49.8, 50.0] : [49.6, 49.7, 49.8, 49.9, 50.0]).forEach((v) => {
      s('line', { x1: m.l, x2: W - m.r, y1: Yf(v), y2: Yf(v), stroke: v === 50 ? C.axis : C.grid }, svg);
      s('text', { x: m.l - 8, y: Yf(v) + 4, 'text-anchor': 'end' }, svg, fmt(v, 1));
    });
    s('text', { x: m.l, y: yf0 - 5, 'text-anchor': 'start' }, svg, 'Frekuensi (Hz)');
    // sumbu p
    [0, 50, 100].forEach((v) => {
      s('line', { x1: m.l, x2: W - m.r, y1: Yp(v), y2: Yp(v), stroke: v === 0 ? C.axis : C.grid }, svg);
      s('text', { x: m.l - 8, y: Yp(v) + 4, 'text-anchor': 'end' }, svg, String(v));
    });
    s('text', { x: m.l, y: yp0 - 8, 'text-anchor': 'start' }, svg, 'Daya injeksi (kW)');
    // sumbu x
    const ticks = xmax === 3 ? [0, 1, 2, 3] : [0, 2, 4, 6, 8, 10];
    ticks.forEach((v) => {
      s('line', { x1: X(v), x2: X(v), y1: yp1, y2: yp1 + 5, stroke: C.axis }, svg);
      s('text', { x: X(v), y: H - 8, 'text-anchor': v === xmax ? 'end' : 'middle' }, svg, v + ' s');
    });
    // garis gangguan
    s('line', { x1: X(0), x2: X(0), y1: yf0, y2: yp1, stroke: C.ink, 'stroke-dasharray': '3 3', opacity: .35 }, svg);

    const i0 = idx(d, 0), i1 = idx(d, xmax), step = xmax > 5 ? 2 : 1;
    const draws = [];
    if (state.k !== 'Tanpa VI') {
      s('path', { d: pathD(X, Yf, d.t, ref.f, i0, i1, step), fill: 'none', stroke: C.ref, 'stroke-width': 1.25, 'stroke-linejoin': 'round' }, svg);
    }
    const pf = s('path', { d: pathD(X, Yf, d.t, D.f, i0, i1, step), fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
    const pp = s('path', { d: pathD(X, Yp, d.t, D.p_kw, i0, i1, step), fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
    draws.push(pf, pp);
    draws.forEach((p) => prepDraw(p, !animate && state.played));

    // label nadir terpilih & acuan
    const mt = D.metrik;
    const lab = s('g', { opacity: (!animate && state.played) ? 1 : 0, style: 'transition: opacity .4s .9s' }, svg);
    if (mt.t_nadir_s <= xmax) {
      s('circle', { cx: X(mt.t_nadir_s), cy: Yf(mt.nadir_Hz), r: 4.5, fill: '#fff', stroke: col, 'stroke-width': 2 }, lab);
      const nx = X(mt.t_nadir_s) + 11, ny = Yf(mt.nadir_Hz) + 14;
      s('text', { x: Math.min(nx, W - m.r - 100), y: ny, class: 'lbl-s', style: `fill:${state.k === 'Rata tanpa SOP' ? C.amberInk : (col === C.ink ? C.ink : col === C.amber ? C.amberInk : col)}` }, lab, 'nadir ' + fmt(mt.nadir_Hz) + ' Hz');
    }
    if (state.k !== 'Tanpa VI' && ref.metrik.t_nadir_s <= xmax) {
      s('circle', { cx: X(ref.metrik.t_nadir_s), cy: Yf(ref.metrik.nadir_Hz), r: 3.5, fill: '#fff', stroke: C.ref, 'stroke-width': 1.5 }, lab);
      s('text', { x: X(ref.metrik.t_nadir_s) + 10, y: Yf(ref.metrik.nadir_Hz) + 4, class: 'lbl-s' }, lab, 'tanpa VI ' + fmt(ref.metrik.nadir_Hz));
    }
    // puncak daya & trip
    if (mt.P_puncak_kW > 0) {
      const pk = D.p_kw.indexOf(Math.max(...D.p_kw));
      const tpk = d.t[pk];
      if (tpk <= xmax) {
        const tx = X(tpk), up = Yp(mt.P_puncak_kW);
        s('circle', { cx: tx, cy: up, r: 3.5, fill: '#fff', stroke: col, 'stroke-width': 2 }, lab);
        const anchorEnd = tx + 110 > W - m.r;
        s('text', { x: anchorEnd ? tx - 8 : tx + 9, y: up - 6, class: 'lbl-s', 'text-anchor': anchorEnd ? 'end' : 'start', style: `fill:${col === C.amber ? C.amberInk : col}` }, lab, 'puncak ' + fmt(mt.P_puncak_kW, 1) + ' kW');
      }
    }
    if (state.k === 'Rata tanpa SOP') {
      d.trips.forEach(([t, c]) => {
        s('line', { x1: X(t), x2: X(t), y1: Yp(0), y2: Yp(112), stroke: C.red, 'stroke-width': 1 }, lab);
      });
      const tx = X(d.trips[1][0]);
      s('text', { x: tx + 8, y: Yp(50) + 3, class: 'lbl-s', style: `fill:${C.red}` }, lab, 'trip kelas B 0,21 s');
      s('text', { x: tx + 8, y: Yp(50) + 16, class: 'lbl-s', style: `fill:${C.red}` }, lab, 'trip kelas A 0,26 s');
    }
    host._lab = lab; host._draws = draws;

    // pemindai
    const cross = s('g', { opacity: 0 }, svg);
    const cl = s('line', { y1: yf0, y2: yp1, stroke: C.ink }, cross);
    const c1 = s('circle', { r: 4, fill: col }, cross);
    const c2 = s('circle', { r: 4, fill: col }, cross);
    const hit = s('rect', { x: m.l, y: yf0, width: W - m.l - m.r, height: yp1 - yf0, fill: 'transparent', style: 'cursor:crosshair' }, svg);
    const move = (ev) => {
      const r = svg.getBoundingClientRect();
      const px = (ev.clientX - r.left) * (W / r.width);
      const t = Math.max(0, Math.min(xmax, (px - m.l) / (W - m.l - m.r) * xmax));
      const i = idx(d, t);
      cross.setAttribute('opacity', 1);
      cl.setAttribute('x1', X(t)); cl.setAttribute('x2', X(t));
      c1.setAttribute('cx', X(t)); c1.setAttribute('cy', Yf(D.f[i]));
      c2.setAttribute('cx', X(t)); c2.setAttribute('cy', Yp(D.p_kw[i]));
      cursor.textContent = `t = ${fmt(d.t[i], 2)} s   f = ${fmt(D.f[i], 3)} Hz   P = ${fmt(D.p_kw[i], 1)} kW`;
    };
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerdown', move);
    hit.addEventListener('pointerleave', () => { cross.setAttribute('opacity', 0); idle(); });
  }

  function metrics() {
    const D = d.cases[state.k], mt = D.metrik, rf = ref.metrik;
    const devPct = (m) => Math.round((1 - (50 - m.nadir_Hz) / (50 - rf.nadir_Hz)) * 100);
    const rocPct = (m) => Math.round((1 - Math.abs(m.rocof_500ms) / Math.abs(rf.rocof_500ms)) * 100);
    const isRef = state.k === 'Tanpa VI';
    const fail = state.k === 'Rata tanpa SOP';
    const card = (k, v, u, dtxt, cls = '') => `<div class="metric"><span class="k mono">${k}</span><div class="v">${v}<small>${u}</small></div><div class="d ${cls}">${dtxt}</div></div>`;
    metricsEl.innerHTML =
      card('Nadir', fmt(mt.nadir_Hz), 'Hz', isRef ? 'acuan, tanpa VI' : `deviasi nadir −${devPct(mt)}% dari tanpa VI`, isRef ? '' : 'good') +
      card('RoCoF 500 ms', fmt(mt.rocof_500ms), 'Hz/s', isRef ? 'acuan, tanpa VI' : `−${rocPct(mt)}% dari tanpa VI`, isRef ? '' : 'good') +
      card('Daya puncak', fmt(mt.P_puncak_kW, 1), 'kW', isRef ? 'tidak ada injeksi' : fail ? 'modul trip pada 0,21 s dan 0,26 s, daya hilang' : state.k === 'ReVIA (adaptif SOP)' ? 'semua modul ≤ 85,6% SOP' : 'dibatasi agar modul aman', fail ? 'bad' : '') +
      card('Energi per kejadian', fmt(mt.E_kWh, 3), 'kWh', 'dari bank sekitar 85,7 kWh');
  }

  function buildChips() {
    chipsEl.innerHTML = '';
    CASES.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip' + (c.k === state.k ? ' on' : ''); b.dataset.k = c.color;
      b.setAttribute('aria-pressed', String(c.k === state.k));
      b.innerHTML = `<i></i>${c.label}`;
      b.addEventListener('click', () => {
        state.k = c.k; animate = true;
        [...chipsEl.children].forEach((x, i) => { const on = CASES[i].k === state.k; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
        update(true);
      });
      chipsEl.appendChild(b);
    });
  }

  function update(anim) {
    animate = !!anim;
    draw(); metrics();
    if (anim) playNow();
    animate = false;
  }
  function playNow() {
    state.played = true;
    (host._draws || []).forEach((p, i) => playDraw(p, 1100, i * 120));
    if (host._lab) host._lab.setAttribute('opacity', 1);
  }

  buildChips();
  draw(); metrics();
  new ResizeObserver(() => { draw(); }).observe(host);
  return {
    play() { playNow(); },
    setRange(r) { state.range = r; state.played = true; update(true); },
  };
}

export async function initCharts() {
  const res = await fetch('data/data_simulasi.json');
  const d = await res.json();
  const hostP = document.querySelector('[data-chart="problem"]');
  const hostC = document.querySelector('[data-chart="cases"]');
  const p = problemChart(hostP, d, document.getElementById('probReadout'));
  const c = casesChart(hostC, d, document.getElementById('caseChips'), document.getElementById('metrics'));

  const watch = (el, fn) => {
    if (!('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold: 0.35 });
    io.observe(el);
  };
  watch(hostP, () => setTimeout(() => p.play(), 250));
  watch(hostC, () => setTimeout(() => c.play(), 250));

  document.querySelectorAll('#rangeSeg button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('#rangeSeg button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    c.setRange(+b.dataset.range);
  }));
}
