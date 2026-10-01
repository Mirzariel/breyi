// Pengaturan renderer bersama untuk adegan 3D (hero dan laci).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export { THREE };

export const isSmall = () => window.matchMedia('(max-width: 700px)').matches;
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createStage(host, { sun = [-4.5, 7.5, 6], target = [0, 1, 0], extent = 5, shadowOpacity = 0.22 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  const dpr = () => Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : 2);
  renderer.setPixelRatio(dpr());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;

  const light = new THREE.DirectionalLight('#fff4e6', 2.6);
  light.position.set(...sun);
  light.target.position.set(...target);
  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);
  light.shadow.bias = -0.0004;
  light.shadow.normalBias = 0.02;
  light.shadow.radius = 5;
  const sc = light.shadow.camera;
  sc.left = -extent; sc.right = extent; sc.top = extent; sc.bottom = -extent; sc.near = 0.5; sc.far = 30;
  scene.add(light, light.target);
  scene.add(new THREE.HemisphereLight('#eef4ff', '#d8d2c6', 0.6));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: shadowOpacity }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.001;
  ground.receiveShadow = true;
  scene.add(ground);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
  const size = { w: 1, h: 1 };
  const listeners = [];
  const fit = () => {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    size.w = w; size.h = h;
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    listeners.forEach((fn) => fn(w, h));
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(fit).observe(host);

  // render hanya saat terlihat di layar
  let visible = false, tick = () => {};
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    renderer.setAnimationLoop(visible ? () => tick() : null);
  }, { rootMargin: '80px' });
  io.observe(host);

  return {
    renderer, scene, camera, light, size,
    onResize: (fn) => { listeners.push(fn); },
    setTick: (fn) => { tick = fn; },
    fit,
    isVisible: () => visible,
    markReady: () => {
      host.classList.add('ready');
      host.parentElement && host.parentElement.classList.add('gl-ready');
    },
  };
}

export function disposeObject(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
}

// Tunggu font siap supaya tekstur label di model memakai Inter.
export async function fontsReady() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('700 40px Inter'), document.fonts.load('600 40px Inter')]),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  } catch (e) { /* abaikan */ }
}
