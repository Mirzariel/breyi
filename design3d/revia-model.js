// Model 3D unit bank baterai EV second-life untuk virtual inertia.
// Satuan meter, sumbu y ke atas. Dipakai bersama oleh render statis dan website.
//
//   import * as THREE from 'three';
//   import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
//   import { buildReVIA, buildDrawerExploded } from './revia-model.js';
//   scene.add(buildReVIA(THREE, RoundedBoxGeometry, { openCabinet: 1, drawerOut: 0.38 }));

export const PALETTE = {
  body: '#eceee9', ink: '#262c31', teal: '#0f8f84', amber: '#e8a33d', green: '#2bd47d',
  steel: '#9aa1a6', alu: '#c9cdd0', module: '#3a4047', pcb: '#1f6b40', hv: '#ef6c1a',
  concrete: '#cfccc5', interior: '#1b1f23', trafo: '#8e9a92',
};

// 20 modul kelas A dan 8 kelas B, disebar agar heterogenitas terlihat.
export const MODULE_CLASS = [
  'A','A','B','A','A','A','A',
  'A','A','A','B','A','A','B',
  'A','B','A','A','A','B','A',
  'B','A','A','A','B','A','B',
];

function makeKit(THREE, RoundedBoxGeometry) {
  const m = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...o });
  const mats = {
    body: m(PALETTE.body, { roughness: 0.5 }),
    ink: m(PALETTE.ink, { roughness: 0.6 }),
    teal: m(PALETTE.teal, { roughness: 0.4 }),
    steel: m(PALETTE.steel, { metalness: 0.6, roughness: 0.35 }),
    alu: m(PALETTE.alu, { metalness: 0.75, roughness: 0.3 }),
    module: m(PALETTE.module, { roughness: 0.45, metalness: 0.2 }),
    pcb: m(PALETTE.pcb, { roughness: 0.5 }),
    chip: m('#15181b', { roughness: 0.4 }),
    hv: m(PALETTE.hv, { roughness: 0.45 }),
    concrete: m(PALETTE.concrete, { roughness: 0.95 }),
    interior: m(PALETTE.interior, { roughness: 0.8 }),
    trafo: m(PALETTE.trafo, { roughness: 0.6, metalness: 0.15 }),
    porcelain: m('#7a4a32', { roughness: 0.3 }),
    ledA: new THREE.MeshStandardMaterial({ color: PALETTE.green, emissive: PALETTE.green, emissiveIntensity: 2.2 }),
    ledB: new THREE.MeshStandardMaterial({ color: PALETTE.amber, emissive: PALETTE.amber, emissiveIntensity: 2.2 }),
    ledTeal: new THREE.MeshStandardMaterial({ color: PALETTE.teal, emissive: '#19c2b2', emissiveIntensity: 1.6 }),
  };
  const shadow = (o) => { o.castShadow = true; o.receiveShadow = true; return o; };
  const box = (w, h, d, mat, r = 0) => shadow(new THREE.Mesh(
    r > 0 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d), mat));
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
  const cyl = (r, h, mat, seg = 32) => shadow(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat));
  const tex = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  };
  const label = (w, h, pxW, draw, emissive = false) => {
    const t = tex(pxW, Math.round(pxW * h / w), draw);
    const mat = emissive
      ? new THREE.MeshBasicMaterial({ map: t, toneMapped: false })
      : new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, transparent: true });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  };
  const tube = (pts, r, mat) => shadow(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 48, r, 12, false), mat));
  return { THREE, mats, box, at, cyl, tex, label, tube, shadow };
}

const FONT = '"Inter","Helvetica Neue","DejaVu Sans",Arial,sans-serif';

function qr(ctx, x, y, s, seed = 7) {
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const n = 21, c = s / n;
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, s, s); ctx.fillStyle = '#111';
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (rnd() > 0.52) ctx.fillRect(x + i * c, y + j * c, c, c);
  for (const [a, b] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    ctx.fillStyle = '#111'; ctx.fillRect(x + a * c, y + b * c, 7 * c, 7 * c);
    ctx.fillStyle = '#fff'; ctx.fillRect(x + (a + 1) * c, y + (b + 1) * c, 5 * c, 5 * c);
    ctx.fillStyle = '#111'; ctx.fillRect(x + (a + 2) * c, y + (b + 2) * c, 3 * c, 3 * c);
  }
}

// ---------- komponen laci (dipakai di kabinet dan exploded view) ----------
function drawerParts(K, idx, cls) {
  const { THREE, mats, box, at, cyl, label, tube } = K;
  const parts = {};
  // nampan
  const tray = new THREE.Group();
  tray.add(at(box(0.66, 0.012, 0.84, mats.steel), 0, 0.006, 0));
  tray.add(at(box(0.012, 0.05, 0.84, mats.steel), -0.324, 0.03, 0));
  tray.add(at(box(0.012, 0.05, 0.84, mats.steel), 0.324, 0.03, 0));
  parts.tray = tray;
  // modul baterai
  const mod = new THREE.Group();
  mod.add(at(box(0.44, 0.15, 0.54, mats.module, 0.012), 0, 0.075, 0));
  const lab = label(0.3, 0.16, 512, (c, w, h) => {
    c.fillStyle = '#f4f4f1'; c.fillRect(0, 0, w, h);
    c.fillStyle = PALETTE.teal; c.fillRect(0, 0, w, h * 0.2);
    c.fillStyle = '#fff'; c.font = `700 ${h * 0.13}px ${FONT}`; c.fillText('SECOND-LIFE MODULE', w * 0.05, h * 0.15);
    c.fillStyle = '#222'; c.font = `600 ${h * 0.12}px ${FONT}`;
    c.fillText('NMC/HC  36s2p  126 V', w * 0.05, h * 0.42);
    c.fillText(cls === 'A' ? 'SOH 80%   R10s 0,08 Ω' : 'SOH 70%   R10s 0,16 Ω', w * 0.05, h * 0.62);
    c.fillText(`SOP 10 s: ${cls === 'A' ? '5,07' : '3,15'} kW`, w * 0.05, h * 0.82);
  });
  lab.rotation.x = -Math.PI / 2; at(lab, 0.0, 0.151, -0.11); mod.add(lab);
  for (const sx of [-0.12, 0.12]) {
    mod.add(at(cyl(0.018, 0.03, sx < 0 ? mats.hv : mats.ink), sx * 1.45, 0.165, -0.235));
  }
  parts.module = mod;
  // BMS
  const bms = new THREE.Group();
  bms.add(at(box(0.3, 0.008, 0.11, mats.pcb), 0, 0, 0));
  for (let i = 0; i < 6; i++) bms.add(at(box(0.03, 0.008, 0.03, mats.chip), -0.11 + i * 0.044, 0.008, -0.02));
  bms.add(at(box(0.05, 0.02, 0.025, mats.alu), 0.12, 0.012, 0.035));
  parts.bms = bms;
  // DC/DC dua arah terisolasi dengan sirip pendingin
  const dcdc = new THREE.Group();
  dcdc.add(at(box(0.5, 0.09, 0.17, mats.alu, 0.01), 0, 0.045, 0));
  for (let i = 0; i < 14; i++) dcdc.add(at(box(0.006, 0.04, 0.16, mats.alu), -0.23 + i * 0.0354, 0.11, 0));
  for (const sx of [-0.15, 0.15]) {
    const port = cyl(0.016, 0.03, mats.hv); port.rotation.x = Math.PI / 2;
    dcdc.add(at(port, sx, 0.045, -0.095));
  }
  parts.dcdc = dcdc;
  // panel depan laci
  const face = new THREE.Group();
  face.add(at(box(0.7, 0.23, 0.025, mats.ink, 0.006), 0, 0, 0));
  const handle = box(0.3, 0.022, 0.03, mats.alu, 0.008); at(handle, 0, -0.06, 0.03); face.add(handle);
  const led = cyl(0.012, 0.01, cls === 'A' ? mats.ledA : mats.ledB); led.rotation.x = Math.PI / 2; at(led, -0.3, 0.07, 0.014); face.add(led);
  const fl = label(0.42, 0.06, 768, (c, w, h) => {
    c.fillStyle = '#e9ecea'; c.font = `600 ${h * 0.5}px ${FONT}`;
    c.fillText(`M-${String(idx + 1).padStart(2, '0')}`, w * 0.02, h * 0.68);
    c.fillStyle = cls === 'A' ? PALETTE.green : PALETTE.amber;
    c.fillText(`${cls} · SOP ${cls === 'A' ? '5,07' : '3,15'} kW`, w * 0.24, h * 0.68);
  });
  fl.material.transparent = true;
  at(fl, -0.04, 0.065, 0.0135); face.add(fl);
  const q = label(0.05, 0.05, 128, (c, w) => qr(c, 0, 0, w, idx + 3)); at(q, 0.3, 0.06, 0.0135); face.add(q);
  parts.face = face;
  parts.cables = [
    tube([[-0.15, 0.10, 0.27], [-0.15, 0.16, 0.18], [-0.12, 0.2, -0.05], [-0.12, 0.18, -0.2]], 0.009, mats.hv),
    tube([[0.15, 0.10, 0.27], [0.16, 0.17, 0.15], [0.12, 0.2, -0.05], [0.12, 0.18, -0.2]], 0.009, mats.ink),
  ];
  return parts;
}

function buildDrawer(K, idx, cls, detailed) {
  const { THREE, at } = K;
  const g = new THREE.Group();
  const p = drawerParts(K, idx, cls);
  at(p.face, 0, 0.115, 0.43); g.add(p.face);
  if (detailed) {
    g.add(p.tray);
    at(p.module, 0, 0.012, -0.12); g.add(p.module);
    at(p.bms, 0, 0.17, 0.0); g.add(p.bms);
    at(p.dcdc, 0, 0.012, 0.31); g.add(p.dcdc);
    p.cables.forEach((c) => g.add(c));
  }
  return g;
}

export function buildDrawerExploded(THREE, RoundedBoxGeometry, { explode = 1, cls = 'A', idx = 16 } = {}) {
  const K = makeKit(THREE, RoundedBoxGeometry);
  const { at } = K;
  const g = new THREE.Group();
  const p = drawerParts(K, idx, cls);
  const e = explode;
  g.add(p.tray);
  at(p.module, 0, 0.012 + 0.1 * e, -0.12); g.add(p.module);
  at(p.bms, 0, 0.17 + 0.24 * e, -0.02); g.add(p.bms);
  at(p.dcdc, 0, 0.012 + 0.1 * e, 0.31 + 0.1 * e); g.add(p.dcdc);
  at(p.face, 0, 0.115 + 0.06 * e, 0.43 + 0.24 * e); g.add(p.face);
  if (e < 0.05) p.cables.forEach((c) => g.add(c));
  g.userData.parts = p;
  return g;
}

// ---------- kabinet ----------
function cabinetShell(K, w, h, d) {
  const { THREE, mats, box, at } = K;
  const g = new THREE.Group();
  const t = 0.025;
  g.add(at(box(w, 0.1, d - 0.06, mats.ink), 0, 0.05, 0));                    // plinth
  g.add(at(box(w, h, t, mats.body, 0.006), 0, 0.1 + h / 2, -d / 2 + t / 2));  // belakang
  g.add(at(box(t, h, d, mats.body, 0.006), -w / 2 + t / 2, 0.1 + h / 2, 0));
  g.add(at(box(t, h, d, mats.body, 0.006), w / 2 - t / 2, 0.1 + h / 2, 0));
  g.add(at(box(w, t, d, mats.body, 0.006), 0, 0.1 + h - t / 2, 0));
  g.add(at(box(w - 2 * t, t, d - t, mats.interior), 0, 0.1 + t / 2, 0));
  g.add(at(box(w - 2 * t, h - 2 * t, 0.01, mats.interior), 0, 0.1 + h / 2, -d / 2 + t + 0.005));
  // pita aksen teal
  g.add(at(box(w + 0.002, 0.05, d + 0.002, mats.teal), 0, 0.1 + h - 0.16, 0));
  return g;
}

function door(K, w, h, { louver = true, screen = null, cls = null } = {}) {
  const { THREE, mats, box, at, label } = K;
  const pivot = new THREE.Group();
  const leaf = new THREE.Group();
  leaf.add(at(box(w, h, 0.03, mats.body, 0.008), w / 2, 0, 0));
  leaf.add(at(box(w + 0.004, 0.05, 0.034, mats.teal), w / 2, h / 2 - 0.16, 0));
  leaf.add(at(box(0.018, 0.5, 0.012, mats.ledTeal), w - 0.06, 0.05, 0.02));
  leaf.add(at(box(0.03, 0.22, 0.035, mats.ink, 0.008), w - 0.1, 0.05, 0.03));
  if (louver) {
    for (let i = 0; i < 9; i++) leaf.add(at(box(w * 0.62, 0.014, 0.03, mats.ink), w / 2 - 0.03, -h / 2 + 0.22 + i * 0.045, 0.022));
  }
  if (screen) { at(screen, w / 2 - 0.05, 0.28, 0.0165); leaf.add(screen); }
  if (cls) {
    const tag = label(0.22, 0.06, 256, (c, ww, hh) => {
      c.fillStyle = PALETTE.ink; c.font = `700 ${hh * 0.6}px ${FONT}`; c.fillText(cls, 0, hh * 0.72);
    });
    at(tag, w * 0.3, h / 2 - 0.3, 0.0165); leaf.add(tag);
  }
  pivot.add(leaf);
  return pivot;
}

function batteryCabinet(K, n, { open = 0, drawerOut = 0 } = {}) {
  const { THREE, at } = K;
  const w = 0.78, h = 2.2, d = 1.0;
  const g = cabinetShell(K, w, h, d);
  for (let k = 0; k < 7; k++) {
    const idx = n * 7 + k, cls = MODULE_CLASS[idx];
    const out = (k === 3 && open > 0.5) ? drawerOut : 0;
    const dr = buildDrawer(K, idx, cls, k === 3);
    at(dr, 0, 0.2 + k * 0.285, -0.03 + out);
    g.add(dr);
  }
  const dp = door(K, w - 0.01, h - 0.02, { cls: `BAT-${n + 1}` });
  at(dp, -w / 2 + 0.005, 0.1 + h / 2, d / 2 + 0.017);
  dp.rotation.y = -open * Math.PI * 0.5;
  g.add(dp);
  return g;
}

function hmiScreen(K) {
  return K.label(0.3, 0.19, 640, (c, w, h) => {
    c.fillStyle = '#0d1418'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#19c2b2'; c.font = `700 ${h * 0.085}px ${FONT}`; c.fillText('VIRTUAL INERTIA · SOP', w * 0.05, h * 0.13);
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1;
    for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(w * 0.05, h * (0.2 + i * 0.12)); c.lineTo(w * 0.62, h * (0.2 + i * 0.12)); c.stroke(); }
    c.strokeStyle = '#19c2b2'; c.lineWidth = 3; c.beginPath();
    for (let i = 0; i <= 100; i++) {
      const t = i / 100, x = w * (0.05 + 0.57 * t);
      const y = h * (0.3 + (t > 0.2 ? 0.25 * Math.exp(-(t - 0.2) * 9) * Math.sin((t - 0.2) * 40 + 0.4) + 0.06 : 0));
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    c.fillStyle = '#e8eceb'; c.font = `600 ${h * 0.075}px ${FONT}`;
    [['f', '49,98 Hz'], ['RoCoF', '−0,02 Hz/s'], ['ΣSOP', '126,6 kW'], ['λ', '1,00']].forEach(([k, v], i) => {
      c.fillStyle = '#8fa3a6'; c.fillText(k, w * 0.67, h * (0.32 + i * 0.15));
      c.fillStyle = '#e8eceb'; c.fillText(v, w * 0.79, h * (0.32 + i * 0.15));
    });
    for (let i = 0; i < 28; i++) {
      c.fillStyle = MODULE_CLASS[i] === 'A' ? PALETTE.green : PALETTE.amber;
      c.fillRect(w * (0.05 + (i % 14) * 0.04), h * (0.74 + Math.floor(i / 14) * 0.1), w * 0.032, h * 0.07);
    }
  }, true);
}

function pcsCabinet(K) {
  const { THREE, mats, box, at, label } = K;
  const w = 1.0, h = 2.2, d = 1.0;
  const g = cabinetShell(K, w, h, d);
  g.add(at(box(w - 0.06, h - 0.1, 0.03, mats.body), 0, 0.1 + h / 2, d / 2 - 0.015));
  const dp = door(K, w - 0.01, h - 0.02, { louver: true, screen: hmiScreen(K) });
  at(dp, -w / 2 + 0.005, 0.1 + h / 2, d / 2 + 0.017);
  g.add(dp);
  const logo = label(0.5, 0.12, 512, (c, ww, hh) => {
    c.fillStyle = PALETTE.ink; c.font = `800 ${hh * 0.62}px ${FONT}`; c.fillText('PCS', 0, hh * 0.75);
    const x = c.measureText('PCS ').width; c.fillStyle = PALETTE.teal; c.fillText('VI', x, hh * 0.75);
  });
  at(logo, -0.1, 0.1 + h - 0.42, d / 2 + 0.034); g.add(logo);
  const sub = label(0.5, 0.05, 512, (c, ww, hh) => {
    c.fillStyle = '#5b666c'; c.font = `600 ${hh * 0.62}px ${FONT}`; c.fillText('PCS 125 kVA · VI controller', 0, hh * 0.75);
  });
  at(sub, -0.1, 0.1 + h - 0.52, d / 2 + 0.034); g.add(sub);
  const warn = label(0.09, 0.08, 128, (c, ww, hh) => {
    c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(ww / 2, 4); c.lineTo(ww - 4, hh - 4); c.lineTo(4, hh - 4); c.closePath(); c.fill();
    c.fillStyle = '#111'; c.font = `900 ${hh * 0.5}px ${FONT}`; c.fillText('⚡', ww * 0.32, hh * 0.82);
  });
  at(warn, 0.33, 1.05, d / 2 + 0.034); g.add(warn);
  return g;
}

function transformer(K) {
  const { THREE, mats, box, at, cyl } = K;
  const g = new THREE.Group();
  g.add(at(box(0.9, 1.15, 0.8, mats.trafo, 0.02), 0, 0.575, 0));
  for (let i = 0; i < 9; i++) {
    g.add(at(box(0.012, 0.85, 0.22, mats.trafo), -0.36 + i * 0.09, 0.55, 0.51));
    g.add(at(box(0.012, 0.85, 0.22, mats.trafo), -0.36 + i * 0.09, 0.55, -0.51));
  }
  for (const x of [-0.25, 0, 0.25]) {
    const b = new THREE.Group();
    for (let k = 0; k < 4; k++) b.add(at(cyl(0.045 - k * 0.002, 0.03, mats.porcelain), 0, k * 0.05, 0));
    b.add(at(cyl(0.012, 0.08, mats.alu), 0, 0.22, 0));
    at(b, x, 1.2, -0.15); g.add(b);
  }
  for (const x of [-0.25, 0, 0.25]) g.add(at(cyl(0.03, 0.1, mats.ink), x, 1.2, 0.2));
  return g;
}

function canopy(K, len, depth) {
  const { THREE, mats, box, at, label } = K;
  const g = new THREE.Group();
  const y = 2.78;
  for (const x of [-len / 2 + 0.1, len / 2 - 0.1]) for (const z of [-depth / 2 + 0.08, depth / 2 - 0.25]) {
    g.add(at(box(0.07, y, 0.07, mats.ink), x, y / 2, z));
  }
  const roof = new THREE.Group();
  roof.add(at(box(len + 0.3, 0.06, depth + 0.3, mats.body, 0.01), 0, 0, 0));
  roof.add(at(box(len + 0.32, 0.14, 0.02, mats.body), 0, -0.04, (depth + 0.3) / 2));
  const fascia = label(1.6, 0.11, 1024, (c, w, h) => {
    c.fillStyle = PALETTE.teal; c.font = `700 ${h * 0.5}px ${FONT}`; c.fillText('SECOND-LIFE', 0, h * 0.72);
    const x2 = c.measureText('SECOND-LIFE').width + 18;
    c.fillStyle = '#5b666c'; c.font = `600 ${h * 0.45}px ${FONT}`; c.fillText('virtual inertia · 100 kW / 10 s', x2, h * 0.72);
  });
  at(fascia, -len / 2 + 0.95, -0.04, (depth + 0.3) / 2 + 0.012); roof.add(fascia);
  roof.rotation.x = -0.03;
  at(roof, 0, y + 0.04, 0);
  g.add(roof);
  return g;
}

export function buildReVIA(THREE, RoundedBoxGeometry, { openCabinet = 1, drawerOut = 0.38, withCanopy = true, withTrafo = true } = {}) {
  const K = makeKit(THREE, RoundedBoxGeometry);
  const { box, at, mats } = K;
  const root = new THREE.Group();
  const gap = 0.02;
  const widths = [0.78, 0.78, 0.78, 0.78, 1.0];
  const total = widths.reduce((a, b) => a + b, 0) + gap * 4;
  let x = -total / 2 - 0.45;
  const units = [];
  widths.forEach((w, i) => {
    const u = i < 4 ? batteryCabinet(K, i, { open: i === 1 ? openCabinet : 0, drawerOut }) : pcsCabinet(K);
    at(u, x + w / 2, 0.22, 0);
    root.add(u); units.push(u);
    x += w + gap;
  });
  root.add(at(box(6.2, 0.22, 2.1, mats.concrete), 0, 0.11, 0.05));                // pad beton
  if (withTrafo) root.add(at(transformer(K), 2.25, 0.22, 0));
  if (withCanopy) root.add(at(canopy(K, 6.0, 1.9), 0, 0.22, 0.05));
  // konduit kabel PCS → trafo
  root.add(K.tube([[1.55, 0.3, -0.3], [1.7, 0.24, -0.3], [1.85, 0.24, -0.3], [1.95, 0.4, -0.3]], 0.035, mats.ink));
  root.userData.units = units;
  return root;
}
