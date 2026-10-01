# Gambar Produk HD (untuk pitch deck)

Semua file berformat PNG resolusi tinggi.

| Folder | Isi |
|---|---|
| `render_transparan/` | Render 3D dengan latar transparan (dirender 3840×2400). Bisa langsung ditaruh di slide berwarna apa pun. |
| `render_latar_putih/` | Render yang sama dengan latar putih. |
| `diagram/` | Diagram alur cara kerja dan arsitektur sistem (400 dpi). |
| `grafik/` | Grafik pembagian daya/arus modul dan respons frekuensi (400 dpi). |
| `halaman_desain_produk/` | Empat halaman PDF Desain Produk sebagai PNG (200 dpi), ditambah tangkapan layar website (3840×2160). |

Render 3D:
1. `01_unit_lengkap_perspektif`: unit lengkap, satu kabinet terbuka dan satu laci ditarik.
2. `02_detail_kabinet_terbuka`: detail laci dengan label modul dan SOP.
3. `03_eksterior_tertutup`: tampak luar dengan semua pintu tertutup.
4. `04_laci_exploded_view`: isi laci yang diurai (modul, BMS, DC/DC, panel depan, nampan).
5. `05_laci_terpasang`: laci dalam kondisi terpasang.

Render dibuat ulang dengan `design3d/render.mjs` (`W=3840 H=2400 OUT=out_hd node render.mjs hero front closed drawer drawer0`).
