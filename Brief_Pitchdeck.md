# Brief Pitchdeck BREYI 2026: Second-Life EV Battery Adaptive Virtual Inertia

**Aturan guidebook:** maksimal **7 slide**. Isi wajib: latar belakang/masalah, solusi, metodologi, hasil dan pembahasan, kesimpulan, serta tim peneliti. Format PDF/PPTX, maksimal 100 MB.
**Sumber angka:** semua angka di bawah diambil dari `extended_abstract/Extended_Abstract_BREYI.pdf`. Jangan menambah angka baru yang tidak ada di naskah, karena juri akan mencocokkan keduanya.
**Aset siap pakai:** `fig_sistem.png` dan `fig_sistem.pdf` (diagram arsitektur) serta `fig_frekuensi.png` (grafik simulasi).

---

## Arahan desain

| Aspek | Ketentuan |
|---|---|
| Rasio | 16:9 (final dipresentasikan di layar panitia) |
| Font | Satu keluarga sans-serif (mis. Montserrat/Inter/Arial) untuk judul dan isi; angka besar bercetak tebal |
| Warna | Hijau energi `#1A8A4A` (solusi/adaptif), biru `#2C62B5` (elektronika daya), oranye `#C27A10` (kendali/aksen), abu `#888888` (baseline "tanpa VI"). Gunakan warna yang sama dengan grafik agar konsisten |
| Kepadatan | Satu pesan utama per slide, ditulis sebagai **judul berbentuk kalimat** (bukan "Hasil", tetapi "Alokasi adaptif menambah 37% kapasitas layanan"). Maksimal ±40 kata isi per slide |
| Angka hero | Tiap slide hasil memiliki 1–3 angka besar (≥40 pt) |
| Footer | Nama tim, universitas, dan nomor slide `x/7` |
| Label jujur | Grafik simulasi wajib diberi keterangan kecil "Simulasi representatif, parameter asumsi (bukan data PLN)". Ini justru memperkuat poin keilmiahan metode |

---

## Slide 1: Latar Belakang & Masalah
**Judul:** *Nusa Penida menuju 100% EBT, tetapi inersia sistemnya ikut berkurang*

Isi:
- Judul penelitian (kecil, di atas) + logo tim/universitas.
- Konteks: target Nusa Penida 100% EBT 2030 (Bali NZE 2045); smart microgrid PLN: PLTS Suana 3,5 MWp + BESS 1,8 MWh + PLTD diesel.
- Rantai masalah (ikon panah): PLTS ↑ → generator diesel online ↓ → inersia ↓ → RoCoF lebih curam & nadir lebih dalam → risiko pelepasan beban dan PLTS sulit ditambah.
- Peluang: baterai EV bekas memiliki kapasitas yang sudah tidak cukup untuk mobil, tetapi masih kuat untuk **daya singkat**.
- Tantangan kunci (kotak oranye): *modul bekas tidak seragam. Jika daya dibagi rata, modul terlemah membatasi seluruh bank.*

Visual: peta kecil Nusa Penida + ikon PLTS/diesel/baterai; sketsa kurva frekuensi "inersia tinggi vs rendah" (boleh ilustratif, beri label *ilustrasi konsep*).

Narasi (±45 dtk): mulai dari target Bali, lalu jelaskan kenapa inersia penting, lalu sampaikan bahwa baterai bekas cocok untuk kebutuhan ini tetapi tidak seragam.

## Slide 2: Solusi
**Judul:** *Bank baterai EV bekas dengan virtual inertia adaptif berbasis State of Power*

Isi:
- Diagram `fig_sistem.png` sebagai visual utama (±60% slide).
- Tiga poin kunci di samping:
  1. **28 modul EV bekas**, masing-masing punya BMS + DC/DC sendiri, sehingga arus tiap modul dapat diatur atau diisolasi.
  2. **Virtual inertia:** inverter menyuntikkan daya sebanding RoCoF: `P = −λKv·df/dt − λKd·Δf`.
  3. **Adaptif SOP:** daya dibagi sesuai kemampuan nyata tiap modul (`p_i ∝ SOP_i`); modul lemah/panas otomatis dikurangi.
- Badge: "Layanan 100 kW / 10 detik".

Narasi: tekankan bahwa kebaruannya bukan "baterai bekas" atau "virtual inertia" secara terpisah, tetapi **hasil uji tiap modul langsung menjadi batas layanan dan gain inersia**.

## Slide 3: Metodologi
**Judul:** *Empat tahap: dari kondisi Nusa Penida hingga simulasi frekuensi*

Isi: alur 4 kotak horizontal.
1. **Kajian kondisi acuan:** dokumen Pemprov Bali & PLN.
2. **Protokol seleksi modul:** inspeksi → isolasi → kapasitas → OCV–SOC & resistansi → uji pulsa → hitung **SOP** (rumus singkat SOP).
3. **Desain arsitektur & kendali:** DC/DC per modul vs CHB; hukum kendali VI adaptif.
4. **Evaluasi:** anggaran daya–energi + simulasi dinamis model frekuensi agregat (Python, 1 ms), 4 kasus pada hardware identik.

Footer kecil: "Parameter yang belum tersedia dari operator dinyatakan sebagai asumsi terbuka."

## Slide 4: Hasil 1, Anggaran Daya & Alokasi
**Judul:** *Pada baterai yang sama, alokasi adaptif menambah 37% kapasitas layanan*

Isi: bar chart horizontal (buat ulang dari Tabel 1):

| Skema | Injeksi bersih |
|---|---|
| Rata tanpa pembatas | ✗ tidak aman: modul B 30,95 A (>25 A, +24%) |
| Rata konservatif | 72,7 kW |
| Rata + clip lokal | 92,2 kW |
| **Adaptif SOP** | **100 kW** (semua modul ≤ 85,6% SOP) |

Angka hero: **105,26 kW** kemampuan bersih · **0,40 kWh** energi/kejadian · **85,7 kWh** energi bank (sizing ditentukan *daya*, bukan energi).

## Slide 5: Hasil 2, Respons Frekuensi & Keekonomian
**Judul:** *Deviasi nadir turun 34% dan RoCoF turun 36% dengan energi hanya 0,16 kWh*

Isi:
- Grafik `fig_frekuensi.png` (kiri, besar). Label: *Simulasi representatif, gangguan 250 kW, H = 1,5 s.*
- Tabel mini: Nadir 49,597 → **49,734 Hz**; RoCoF −0,803 → **−0,512 Hz/s**; energi **0,156 kWh**.
- Satu baris robust: "Konsisten pada H = 1,0–2,0 s."
- Kotak biaya: **Rp509,34 juta** (28 modul layak dari 35 diuji) vs Rp568,10 juta untuk konfigurasi modul baru (estimasi, bukan penawaran vendor).

Narasi jujur (bernilai di mata juri): selisih adaptif vs *clip* pada nadir kecil (0,008 Hz). Nilai utama adaptif adalah **kapasitas yang bisa dijanjikan dan keamanan modul**, bukan sekadar nadir.

## Slide 6: Kesimpulan & Peta Jalan
**Judul:** *Jalur modular untuk menambah inersia sistem pulau dari baterai yang sudah ada*

Isi:
- 3 kesimpulan (ikon centang):
  1. Layanan 100 kW/10 s dari 28 modul bekas, semua modul dalam batas aman.
  2. Deviasi nadir −34% dan RoCoF −36% pada model representatif.
  3. Kebaruan: karakterisasi modul → SOP → gain inersia yang dapat ditelusuri.
- Dampak: mendukung penambahan PLTS Nusa Penida, memperpanjang umur material baterai EV (ekonomi sirkular), dan dapat direplikasi di pulau lain di Indonesia.
- Peta jalan 5 gerbang (timeline): data PLN & pembanding BESS eksisting → karakterisasi modul nyata → simulasi EMT → uji HIL → demonstrasi terbatas.

## Slide 7: Tim Peneliti
**Judul:** *Tim [Nama Tim]*

Isi: foto + nama + prodi/universitas + peran tiap anggota (contoh: Ketua – kendali & simulasi; Anggota – karakterisasi baterai; Anggota – keekonomian & kebijakan). Tambahkan nama dosen pembimbing bila ada, serta satu kalimat penutup/tagline: *"Baterai bekas, inersia baru untuk pulau energi bersih."*

---

## Persiapan tanya-jawab juri (bukan untuk slide)

| Pertanyaan | Jawaban inti |
|---|---|
| Apakah baterai menghasilkan inersia? | Tidak secara fisik. Inverter meniru respons inersia; baterai menyediakan daya dan energi. |
| Kenapa tidak cukup pakai SOH 80%? | SOH mengukur kapasitas (energi), sedangkan layanan VI dibatasi daya pulsa, yaitu resistansi dan suhu. Karena itu yang dipakai adalah SOP. |
| Nusa Penida sudah punya BESS 1,8 MWh? | Benar. Tahap pertama peta jalan adalah membandingkan opsi ini dengan peningkatan kendali BESS eksisting. Bank second-life layak jika kebutuhan cadangan tambahan terbukti. |
| Datanya dari PLN? | Belum. Parameter sistem bersifat representatif dan terbuka (Lampiran A), dan kode dapat direproduksi. Langkah pertama adalah konfirmasi data operator. |
| Kenapa bank 85,7 kWh kalau per kejadian hanya 0,4 kWh? | Jumlah modul ditentukan kebutuhan daya dan batas arus, bukan energi. |
| Grid-forming / black start? | Rancangan awal bersifat grid-following. Grid-forming adalah pengembangan berikutnya. |
| Lebih murah dan lebih hijau? | Estimasi awal Rp58,8 juta lebih rendah, tetapi bergantung harga dan umur sisa. Perbandingan final memakai NPC dan LCA dengan unit fungsional yang sama. |
| Modul gagal saat beroperasi? | BMS memutus modul, SOP dan λ turun, sisa daya didistribusikan ulang, dan kekurangan layanan dilaporkan. Satu modul A terisolasi masih menyisakan 100,97 kW. |
| Kenapa DC/DC per modul, bukan CHB? | Kontrol dan isolasi per modul lebih langsung. Konsekuensinya biaya dan rugi konversi lebih besar; CHB tetap opsi untuk skala lebih besar. |
