import { THREE, createStage, reducedMotion, disposeObject, fontsReady } from './scene-common.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildDrawerExploded } from './revia-model.js';

export async function initDrawer() {
  const host = document.getElementById('drawerGL');
  const stageEl = document.getElementById('drawerStage');
  const hsHost = document.getElementById('hotspots');
  const slider = document.getElementById('explode');
  const valEl = document.getElementById('explodeVal');
  const partsList = document.getElementById('parts');
  await fontsReady();

  const S = createStage(host, { sun: [-1.2, 3.2, 2.2], target: [0, 0, 0], extent: 1.5, shadowOpacity: 0.2 });
  const { scene, camera, renderer } = S;
  const target = new THREE.Vector3(0, 0.2, 0.12);
  const dir = new THREE.Vector3(1.9, 1.27, 2.13).normalize();
  camera.fov = 26;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.5;
  controls.maxPolarAngle = 1.45;
  controls.autoRotate = false;
  renderer.domElement.style.touchAction = 'pan-y';
  renderer.domElement.setAttribute('aria-hidden', 'true');

  let userZoom = false;
  S.onResize((w, h) => {
    const k = Math.max(1, 1.45 / (w / h));
    camera.position.copy(target).add(dir.clone().multiplyScalar(3.15 * k * 1.02));
  });
  S.fit();
  controls.update();

  // ---- model ----
  let cls = 'A', group = null, parts = null, e = 0;
  const build = () => {
    if (group) { scene.remove(group); disposeObject(group); }
    group = buildDrawerExploded(THREE, RoundedBoxGeometry, { explode: 0, cls, idx: cls === 'A' ? 16 : 15 });
    parts = group.userData.parts;
    scene.add(group);
    apply(e);
  };
  // rumus posisi sama dengan buildDrawerExploded, supaya bisa dianimasikan tanpa membangun ulang
  function apply(v) {
    e = v;
    parts.module.position.set(0, 0.012 + 0.1 * v, -0.12);
    parts.bms.position.set(0, 0.17 + 0.24 * v, -0.02);
    parts.dcdc.position.set(0, 0.012 + 0.1 * v, 0.31 + 0.1 * v);
    parts.face.position.set(0, 0.115 + 0.06 * v, 0.43 + 0.24 * v);
    // kabel mengikuti: naik bersama modul dan memanjang ke konverter
    const sz = 1 + (0.1 * v) / 0.47;
    parts.cables.forEach((c) => { c.position.set(0, 0.1 * v, -0.2 * (1 - sz)); c.scale.set(1, 1, sz); });
    valEl.textContent = Math.round(v * 100) + '%';
    slider.setAttribute('aria-valuetext', valEl.textContent);
  }

  // ---- hotspot ----
  const anchors = [
    null,
    () => new THREE.Vector3(0.0, 0.17 + 0.1 * e, -0.12),
    () => new THREE.Vector3(-0.14, 0.18 + 0.24 * e, -0.02),
    () => new THREE.Vector3(0.0, 0.012 + 0.1 * e + 0.09, 0.31 + 0.1 * e),
    () => new THREE.Vector3(0.3, 0.115 + 0.06 * e + 0.09, 0.44 + 0.24 * e),
    () => new THREE.Vector3(0.14, 0.2 + 0.1 * e, 0.02 + 0.05 * e),
  ];
  const hs = [];
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement('button');
    b.className = 'hs'; b.type = 'button'; b.textContent = i;
    b.setAttribute('aria-label', 'Komponen ' + i);
    b.addEventListener('mouseenter', () => activate(i, false));
    b.addEventListener('focus', () => activate(i, false));
    b.addEventListener('click', () => activate(i, true));
    hsHost.appendChild(b); hs.push(b);
  }
  const items = [...partsList.querySelectorAll('li')];
  function activate(i) {
    hs.forEach((b, k) => b.classList.toggle('on', k + 1 === i));
    items.forEach((li) => li.classList.toggle('on', +li.dataset.hs === i));
  }
  items.forEach((li) => {
    const i = +li.dataset.hs;
    const btn = li.querySelector('button');
    btn.addEventListener('mouseenter', () => activate(i));
    btn.addEventListener('focus', () => activate(i));
    btn.addEventListener('click', () => activate(i));
  });
  activate(1);

  const v = new THREE.Vector3();
  const place = () => {
    for (let i = 0; i < 5; i++) {
      v.copy(anchors[i + 1]()).project(camera);
      const x = (v.x * 0.5 + 0.5) * S.size.w, y = (-v.y * 0.5 + 0.5) * S.size.h;
      hs[i].style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      hs[i].classList.add('show');
    }
  };

  // ---- kontrol ----
  let tween = null;
  const to = (target, ms = 1400) => {
    cancelAnimationFrame(tween);
    const from = e, t0 = performance.now();
    if (reducedMotion()) { slider.value = target; apply(target); return; }
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms), eased = 1 - Math.pow(1 - k, 3);
      const val = from + (target - from) * eased;
      slider.value = val; apply(val);
      if (k < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  };
  slider.addEventListener('input', () => { cancelAnimationFrame(tween); apply(+slider.value); });
  document.querySelectorAll('[data-cls]').forEach((b) => b.addEventListener('click', () => {
    cls = b.dataset.cls;
    document.querySelectorAll('[data-cls]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    build();
  }));

  build();
  S.setTick(() => { controls.update(); place(); renderer.render(scene, camera); });
  renderer.render(scene, camera);
  S.markReady();

  // animasi urai saat pertama terlihat
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) { io.disconnect(); setTimeout(() => to(1, 1800), 350); }
  }, { threshold: 0.45 });
  io.observe(stageEl);
}
