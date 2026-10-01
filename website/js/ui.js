// Interaksi non-3D: navigasi, reveal, alur, demo pembagian daya, batang.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (n, d = 2) => n.toFixed(d).replace('.', ',');

function once(els, fn, opts = { threshold: 0.2 }) {
  if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } });
  }, opts);
  els.forEach((el) => io.observe(el));
}

function nav() {
  const header = $('.site-header'), btn = $('#menuBtn'), menu = $('#nav');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }));

  const links = new Map($$('a', menu).map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const a = links.get(e.target.id);
      if (a && e.isIntersecting) { links.forEach((x) => x.classList.remove('active')); a.classList.add('active'); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  const heroEl = $('.hero');
  if (heroEl) new IntersectionObserver(([e]) => { if (e.isIntersecting) links.forEach((x) => x.classList.remove('active')); }, { rootMargin: '-45% 0px -50% 0px' }).observe(heroEl);
}

function reveal() {
  once($$('.reveal'), (el) => el.classList.add('in'), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
}

function flow() {
  $$('.steps').forEach((list) => {
    $$('.step', list).forEach((s, i) => { s.style.setProperty('--i', i); });
    once($$('.step', list), (el) => {
      const i = +el.style.getPropertyValue('--i') || 0;
      setTimeout(() => el.classList.add('on'), 90 * i);
    }, { threshold: 0.6, rootMargin: '0px 0px -8% 0px' });
  });
  once($$('#road li'), (el) => {
    const i = $$('#road li').indexOf(el);
    setTimeout(() => el.classList.add('on'), 110 * i);
  }, { threshold: 0.8 });
}

// QR ilustrasi (bukan kode sebenarnya), sama gayanya dengan label di model 3D
function qr() {
  const c = $('#qr'); if (!c) return;
  const ctx = c.getContext('2d'), n = 21, s = c.width, u = s / n;
  let r = 20;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, s, s); ctx.fillStyle = '#111';
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (rnd() > 0.52) ctx.fillRect(i * u, j * u, u, u);
  for (const [a, b] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    ctx.fillStyle = '#111'; ctx.fillRect(a * u, b * u, 7 * u, 7 * u);
    ctx.fillStyle = '#fff'; ctx.fillRect((a + 1) * u, (b + 1) * u, 5 * u, 5 * u);
    ctx.fillStyle = '#111'; ctx.fillRect((a + 2) * u, (b + 2) * u, 3 * u, 3 * u);
  }
}

// Demo: 100 kW dibagi ke 28 modul, rata vs sebanding SOP
function split() {
  const host = $('#splitBars'), note = $('#splitNote'); if (!host) return;
  const SOP = { A: 5.07, B: 3.15 }, P = 100;
  const cls = [];
  const order = ['A','A','B','A','A','A','A','A','A','A','B','A','A','B','A','B','A','A','A','B','A','B','A','A','A','B','A','B']; // sama dengan susunan di model 3D
  order.forEach((c) => cls.push(c));
  const sum = cls.reduce((a, c) => a + SOP[c], 0);
  const line = document.createElement('div'); line.className = 'limitline';
  host.appendChild(line);
  const cells = cls.map((c) => {
    const m = document.createElement('div'); m.className = 'm ' + c.toLowerCase();
    m.appendChild(document.createElement('i')); host.appendChild(m);
    return { m, i: m.firstChild, c };
  });
  // Angka per modul dari perhitungan paper (efisiensi 0,94, beban bantu 2 kW)
  const LOAD = { equal: { A: 3.87, B: 3.87 }, sop: { A: 4.34, B: 2.70 } };
  function setMode(mode) {
    cells.forEach(({ m, i, c }) => {
      const rel = LOAD[mode][c] / SOP[c];        // 1 = tepat di batas SOP
      i.style.height = (rel * 80) + '%';          // garis batas di 80% tinggi
      m.classList.toggle('over', mode === 'equal' && c === 'B');
    });
    if (mode === 'equal') {
      note.className = 'split-note bad';
      note.innerHTML = `Tiap modul menerima <b>${fmt(LOAD.equal.A)} kW</b>. Di kelas B itu setara arus <b>30,95 A</b>, melewati batas <b>25 A</b>, jadi modul B trip lebih dulu, bebannya pindah ke modul lain, dan bank bisa lepas seluruhnya.`;
    } else {
      note.className = 'split-note good';
      note.innerHTML = `Kelas A menerima <b>${fmt(LOAD.sop.A)} kW</b> (34,1 A) dan kelas B <b>${fmt(LOAD.sop.B)} kW</b> (21,3 A). Semua modul ≤ 85,6% SOP, tidak ada yang tiba di batas lebih dulu.`;
    }
  }
  $$('.seg [data-mode]').forEach((b) => b.addEventListener('click', () => {
    $$('.seg [data-mode]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    setMode(b.dataset.mode);
  }));
  // mulai dari nol, naik saat terlihat
  cells.forEach(({ i }) => { i.style.height = '0%'; });
  once([host], () => setTimeout(() => setMode('equal'), 150), { threshold: 0.5 });
}

function bars() {
  const run = (card, max) => once([card], () => {
    $$('li', card).forEach((li, i) => {
      const f = $('.fill', li); if (!f) return;
      const v = parseFloat(li.dataset.v);
      setTimeout(() => { f.style.width = (v / max * 100) + '%'; }, 150 + i * 140);
    });
  }, { threshold: 0.4 });
  const a = $('#allocCard'), c = $('#costCard');
  if (a) run(a, 100);
  if (c) run(c, 600);
}

export function initUI() { nav(); reveal(); flow(); qr(); split(); bars(); }
