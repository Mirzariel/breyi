# Brief Pitchdeck ReVIA (BREYI 2026)

**Aturan guidebook:** maksimal 7 slide, wajib memuat latar belakang/masalah, solusi, metodologi, hasil dan pembahasan, kesimpulan, dan tim peneliti.
**Sumber angka:** `extended_abstract/Extended_Abstract_BREYI.pdf`. Jangan memakai angka yang tidak ada di naskah.

**Aset siap pakai:**
- `figures/render_hero.png`, `render_drawer.png`, `render_front.png`, `render_closed.png`: render 3D dengan latar transparan.
- `figures/fig_alokasi.pdf/.png` dan `figures/fig_frekuensi.pdf/.png`: grafik hasil.
- `desain_produk/Desain_Produk_ReVIA.pdf`: halaman 4 berisi alur 6 langkah dan diagram arsitektur yang bisa dipotong.
- `website/`: landing page. Bisa dibuka saat sesi tanya-jawab untuk memutar model 3D.

## Gaya visual

- 16:9, latar putih hangat `#F5F6F3`.
- Teks utama `#262C31`, aksen teal `#0F8F84` (dipakai hemat), kuning `#E8A33D` untuk modul kelas B.
- Font sama seperti website: Manrope/Inter untuk judul dan isi, angka tebal. Bila harus konsisten dengan naskah, pakai Times New Roman.
- Judul slide berupa kalimat yang menyampaikan pesan, misalnya "Pembagian rata membuat bank trip dalam 0,26 detik", bukan "Hasil".
- Satu pesan per slide. Isi maksimal ±35 kata, sisanya visual.
- Footer: ReVIA · Universitas Gadjah Mada · nomor slide x/7.

## Slide 1: Masalah

**Judul:** Nusa Penida menuju 100% EBT, tapi inersianya ikut hilang

- Kiri: tiga angka besar, yaitu 100% EBT 2030, PLTS Suana 3,5 MWp, dan BESS 1,8 MWh.
- Kanan: rantai sebab-akibat sebagai garis ikon: PLTS naik → diesel online turun → inersia turun → frekuensi jatuh lebih cepat → risiko pelepasan beban.
- Bawah, dengan warna kuning: "Baterai mobil listrik bekas cocok untuk daya singkat, tapi kondisinya tidak seragam."
- Narasi (40 dtk): mulai dari target Bali, jelaskan arti inersia memakai analogi roda gila, lalu masuk ke peluang dan masalah baterai bekas.

## Slide 2: Solusi

**Judul:** ReVIA: 28 modul bekas, masing-masing di lacinya sendiri

- Visual utama: `render_hero.png` dengan 3 label, yaitu laci modul, kabinet PCS, dan atap peneduh.
- Tiga kartu di kanan:
  1. SOP passport (QR) per modul.
  2. Laci dengan BMS + DC/DC 6 kW.
  3. Pembagian daya sesuai SOP: `p_i ∝ SOP_i`.
- Badge: 100 kW · 10 s.

## Slide 3: Metodologi

**Judul:** Uji modul, beri SOP, bagi daya, lalu uji di simulasi

- Pakai alur 6 langkah dari halaman 4 Desain Produk: Kumpulkan → Uji → SOP passport → Pasang di laci → Deteksi → Injeksi.
- Di bawahnya tampilkan persamaan kendali `P = −λK_v·df/dt − λK_d·Δf` dan satu baris evaluasi: "Anggaran daya + simulasi model frekuensi (Python, 1 ms), 4 skema pada perangkat yang sama."

## Slide 4: Hasil 1, keamanan modul

**Judul:** Pembagian rata membuat bank trip dalam 0,26 detik; ReVIA tetap 100 kW

- Visual: `fig_alokasi.png` (bar chart dan grafik arus per modul).
- Angka besar: **100 kW** vs 72,7 kW, atau **+37%** dengan baterai yang sama.
- Narasi: modul B melewati 25 A → trip → beban pindah ke modul A → modul A ikut trip. ReVIA menahan semua modul di bawah 86% SOP.

## Slide 5: Hasil 2, frekuensi dan biaya

**Judul:** Deviasi nadir turun 34% dengan energi hanya 0,156 kWh

- Visual: `fig_frekuensi.png`.
- Tiga angka: nadir 49,597 → **49,734 Hz**, RoCoF **−36%**, energi **0,156 kWh**.
- Kotak kecil: estimasi Rp509 juta, dibanding Rp568 juta untuk konfigurasi sama dengan modul baru.
- Catatan kecil: "Simulasi representatif, belum memakai data PLN."
- Narasi jujur: selisih nadir ReVIA dan pembatas lokal hanya 0,008 Hz. Nilai utama ReVIA ada di daya yang bisa dijamin dan modul yang tidak trip.

## Slide 6: Kesimpulan dan peta jalan

**Judul:** Baterai bekas bisa menjadi inersia, asal setiap modul dikenali

- Tiga kesimpulan singkat: 100 kW aman dari 28 modul bekas; trip berantai dapat dicegah; nadir −34% dan RoCoF −36%.
- Timeline 5 langkah: data PLN dan pembanding BESS eksisting → karakterisasi modul nyata → simulasi EMT → uji HIL → demonstrasi terbatas.
- Dampak: menambah ruang PLTS di Nusa Penida dan memberi umur kedua bagi baterai EV.

## Slide 7: Tim

**Judul:** Tim ReVIA, Universitas Gadjah Mada

- Mirzariel Akmal Norman (ketua), Bagus Aldiguna, Irma Nur Cahyani. Tambahkan foto, prodi, dan peran masing-masing, misalnya kendali dan simulasi, karakterisasi baterai, serta desain dan keekonomian.
- Penutup: render `render_closed.png` kecil dan kalimat "Baterai bekas, inersia baru."

## Persiapan tanya-jawab

| Pertanyaan | Jawaban inti |
|---|---|
| Baterai kan tidak punya inersia? | Benar. Inverter meniru respons inersia dengan menyuntikkan daya sebanding df/dt. Baterai hanya menyediakan daya dan energinya. |
| Kenapa bukan SOH saja? | SOH mengukur kapasitas. Layanan inersia dibatasi daya pulsa, yang ditentukan resistansi dan suhu. Karena itu yang dipakai SOP. |
| Data Nusa Penida dari PLN? | Belum. Parameter sistem bersifat representatif dan semuanya tercantum di Lampiran A. Validasi dengan data PLN adalah langkah pertama peta jalan. |
| Sudah ada BESS 1,8 MWh, kenapa perlu unit baru? | Pembaruan kendali BESS eksisting harus dibandingkan lebih dulu. ReVIA layak bila cadangan inersia tambahan memang dibutuhkan, atau BESS eksisting dipakai untuk layanan energi. |
| Kenapa 85,7 kWh kalau tiap kejadian hanya butuh 0,4 kWh? | Jumlah modul ditentukan kebutuhan daya dan batas arus, bukan energi. |
| Asumsi trip 50 ms terlalu keras? | Itu skenario terburuk untuk pembagian rata tanpa pembatas. Pembanding yang adil, yaitu rata + clip, tetap disajikan: 92,2 kW. |
| Kalau modul rusak saat operasi? | BMS memutus modul tersebut, SOP total dan λ turun, lalu sisa daya dibagi ulang. Tanpa satu modul A, kapasitas masih 100,97 kW. |
| Lebih murah? | Estimasi awal Rp58,8 juta lebih rendah, tetapi masih bergantung harga dan umur sisa. Perbandingan final memakai NPC. |
