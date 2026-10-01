import { initUI } from './ui.js';
import { initCharts } from './charts.js';

initUI();
initCharts().catch((e) => console.error('Grafik gagal dimuat:', e));

// 3D dimuat terpisah: jika WebGL tidak tersedia, gambar poster tetap tampil.
(async () => {
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) throw new Error('WebGL tidak tersedia');
    const [{ initHero }, { initDrawer }] = await Promise.all([import('./hero.js'), import('./drawer.js')]);
    await Promise.all([initHero(), initDrawer()]);
  } catch (e) {
    console.warn('Adegan 3D dinonaktifkan, memakai gambar statis:', e.message);
  }
})();
