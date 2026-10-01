# Second-Life VI: halaman web

Halaman tunggal (HTML/CSS/JS statis, tanpa build) untuk proyek riset baterai EV bekas sebagai inersia virtual
(Repurposed-battery Virtual Inertia, Adaptive), BREYI 2026.

## Menjalankan

Modul ES dan `fetch` data membutuhkan server lokal (tidak bisa dibuka lewat `file://`).
Dari folder induk:

    npx http-server website
    # atau
    cd website && python3 -m http.server 8000

lalu buka http://localhost:8000.

## Struktur

    index.html            markup, teks Bahasa Indonesia, sprite ikon SVG
    css/style.css         gaya halaman (grid 12 kolom, token warna di :root)
    css/fonts.css         @font-face untuk font yang di-host lokal
    js/main.js            titik masuk
    js/ui.js              navigasi, reveal, alur, demo bagi rata vs SOP, batang
    js/charts.js          grafik SVG (frekuensi, pilihan skema) dari data/data_simulasi.json
    js/scene-common.js    renderer three.js, lampu, bayangan, render hanya saat terlihat
    js/hero.js            adegan 3D unit (OrbitControls, putar bolak-balik)
    js/drawer.js          adegan 3D laci terurai, slider, hotspot
    js/revia-model.js     model 3D (salinan dari design3d/revia-model.js)
    data/                 data_simulasi.json (hasil simulasi representatif)
    assets/               hero.png, drawer.png (gambar cadangan jika WebGL tidak ada), fonts/
    vendor/three/         three.js 0.170.0 (build min + addons yang dipakai), dimuat lewat import map
    screenshots/          hasil verifikasi desktop dan mobile

## Catatan

- Font (Inter, Inter Tight, JetBrains Mono) berasal dari Google Fonts dan disimpan lokal
  di `assets/fonts/` (subset latin, latin-ext, greek), jadi halaman tidak memanggil
  jaringan luar.
- Adegan 3D hanya dirender saat terlihat di layar; devicePixelRatio dibatasi 2 (1,5 di
  layar kecil); shadow map 2048.
- `prefers-reduced-motion`: putaran otomatis, animasi garis, dan reveal dimatikan.
- Angka hasil berasal dari perhitungan pra-desain dan simulasi representatif, bukan data
  lapangan PLN.
