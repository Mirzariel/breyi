import { THREE, createStage, isSmall, reducedMotion, fontsReady } from './scene-common.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildReVIA } from './revia-model.js';

export async function initHero() {
  const host = document.getElementById('heroGL');
  const stageEl = document.getElementById('heroStage');
  const ui = document.getElementById('heroUI');
  await fontsReady();

  const S = createStage(host, { sun: [-4.5, 7.5, 6], target: [0, 1, 0], extent: 5.2 });
  const { scene, camera, renderer } = S;
  const model = buildReVIA(THREE, RoundedBoxGeometry, { openCabinet: 1, drawerOut: 0.4 });
  scene.add(model);

  const target = new THREE.Vector3(-0.2, 0.85, 0);
  const dir = new THREE.Vector3(5.8, 2.15, 7.4).normalize();
  const reduced = reducedMotion();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = false;           // zoom lewat tombol, supaya gulir halaman tidak tersandera
  controls.minPolarAngle = 0.75;
  controls.maxPolarAngle = 1.5;
  controls.minAzimuthAngle = -0.35;
  controls.maxAzimuthAngle = 1.35;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.8;
  renderer.domElement.style.touchAction = 'pan-y';
  renderer.domElement.setAttribute('aria-hidden', 'true');

  let zoomK = 1, userZoom = false;
  const fitDist = (aspect) => Math.max(9.6, 8.4 / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * Math.min(aspect, 2.3)));
  const setDist = (d) => {
    const v = camera.position.clone().sub(controls.target);
    v.setLength(THREE.MathUtils.clamp(d, 5, 20));
    camera.position.copy(controls.target).add(v);
  };
  S.onResize((w, h) => {
    const wide = w >= 900;
    if (wide) camera.setViewOffset(w, h, -w * 0.21, 0, w, h); else camera.clearViewOffset();
    if (!userZoom) setDist(fitDist(w / h) * (wide ? 1.36 : 1.05));
  });
  camera.position.copy(target).add(dir.clone().multiplyScalar(10));
  S.fit();
  controls.update();

  const zoomBy = (f) => { userZoom = true; setDist(camera.position.distanceTo(controls.target) * f); };
  document.getElementById('heroIn').addEventListener('click', () => zoomBy(0.85));
  document.getElementById('heroOut').addEventListener('click', () => zoomBy(1.18));
  const rotBtn = document.getElementById('heroRot');
  if (reduced) { rotBtn.setAttribute('aria-pressed', 'false'); rotBtn.setAttribute('aria-label', 'Putar otomatis'); rotBtn.querySelector('use').setAttribute('href', '#i-play'); }
  rotBtn.addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    rotBtn.setAttribute('aria-pressed', String(controls.autoRotate));
    rotBtn.setAttribute('aria-label', controls.autoRotate ? 'Jeda putaran otomatis' : 'Putar otomatis');
    rotBtn.querySelector('use').setAttribute('href', controls.autoRotate ? '#i-pause' : '#i-play');
  });
  controls.addEventListener('start', () => { stageEl.dataset.drag = '1'; });

  // label melayang di atas komponen
  const anchors = {
    bat: new THREE.Vector3(-1.75, 3.3, 0.9),
    pcs: new THREE.Vector3(1.55, 3.3, 0.9),
    trafo: new THREE.Vector3(2.25, 1.75, 0.45),
  };
  const tags = [...stageEl.querySelectorAll('.tag')].map((el) => ({ el, p: anchors[el.dataset.anchor] }));
  const v = new THREE.Vector3();
  const place = () => {
    const show = window.innerWidth > 900;
    for (const t of tags) {
      if (!show) { t.el.classList.remove('show'); continue; }
      v.copy(t.p).project(camera);
      const x = (v.x * 0.5 + 0.5) * S.size.w, y = (-v.y * 0.5 + 0.5) * S.size.h;
      t.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      t.el.classList.add('show');
    }
  };

  let dec = true;                                  // kecepatan positif = azimut mengecil
  S.setTick(() => {
    if (controls.autoRotate) {                     // bolak-balik, tidak berputar penuh
      const a = controls.getAzimuthalAngle();
      if (a > 1.1) dec = true; else if (a < 0.05) dec = false;
      controls.autoRotateSpeed = dec ? 0.8 : -0.8;
    }
    controls.update();
    place();
    renderer.render(scene, camera);
  });
  renderer.render(scene, camera);
  S.markReady();
  ui.hidden = false;
}
