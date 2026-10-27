# Jejak yang Hilang

Game React dengan layar judul, pilihan Single Player dan Multiplayer, lima karakter, empat latar lokasi, musik dan efek suara, serta 12 teka-teki matematika berdasarkan dokumen **Alur Game** dan lima gambar karakter dari folder tugas.

## Ringkasan cerita

Raka, Agen R, mencari rekannya Vira yang menghilang setelah menemukan kebocoran data. Di empat lokasi, ia membaca pesan Vira, memecahkan kode matematika, dan mencari berkas bukti yang disembunyikan. Nara membantu menguji pesan itu, sementara jejak fungsi invers mengungkap bahwa Arman, kepala divisi sendiri, adalah pembocornya. Pada akhir misi, Raka harus membawa bukti keluar dari markas sebelum sistem menghapusnya. Hasil cerita bergantung pada jumlah berkas, kesalahan, dan apakah Raka berhasil lolos.

## Cara menjalankan di laptop ini

Node.js dan Visual Studio Code sudah terpasang. React sudah terpasang di folder proyek ini.

1. Buka folder `D:\Project-Echo` di Visual Studio Code.
2. Pilih **Terminal → New Terminal**.
3. Ketik `npm.cmd install` bila baru mengunduh proyek, lalu `npm.cmd run dev` dan Enter.
4. Buka alamat **Local** yang muncul di terminal, biasanya `http://127.0.0.1:5173/`.
5. Biarkan terminal terbuka selama bermain. Untuk berhenti, tekan **Ctrl+C**.

## Deploy ke Vercel

Repository GitHub game ini adalah `https://github.com/adityanurarif9-ai/game_echo`. Masuk ke Vercel, pilih **Add New → Project**, hubungkan GitHub, lalu impor repository `game_echo`. Proyek sudah menyediakan `vercel.json` dengan preset Vite, perintah build `npm run build`, dan folder hasil `dist`. Setelah deploy, setiap push ke cabang `main` akan memicu deploy produksi berikutnya.

**Single Player** dapat dimainkan di alamat Vercel dari laptop atau HP tanpa menjalankan server lokal. Untuk **Multiplayer lewat internet**, deploy server ruang dari repository ini ke Render, lalu isi alamatnya pada layar Multiplayer. Render menjalankan `npm run server` dan menyediakan koneksi langsung untuk dua pemain. Server ini menyimpan ruang dan skor selama prosesnya hidup; ruang akan hilang jika server restart atau tertidur. Koin Single Player tersimpan di browser masing-masing, belum menjadi akun online.

### Menyalakan server Multiplayer online

1. Buka [Render Dashboard](https://dashboard.render.com/) dan masuk dengan GitHub.
2. Pilih **New → Blueprint**, lalu pilih repository `adityanurarif9-ai/game_echo`. Render akan membaca `render.yaml` dan membuat layanan `game-echo-room` pada paket Free. Jika memilih **New → Web Service** secara manual, isi **Build Command** `npm ci`, **Start Command** `npm run server`, dan **Health Check Path** `/health`.
3. Tunggu sampai status layanan **Live**. Salin alamat publik `https://...onrender.com` yang ditampilkan Render. Buka alamat itu di browser; bila server siap, muncul `{"ok":true,"service":"jejak-yang-hilang-room"}`.
4. Buka game di Vercel → **Play → Multiplayer**. Masukkan alamat Render tadi ke kolom **Alamat server multiplayer**, lalu tekan **Buat Ruang Baru**. Tunggu jika layanan Free baru bangun dari tidur.
5. Salin tautan ruang yang muncul dan kirim ke teman. Teman membuka tautan dari laptop/HP lain, tekan **Play → Multiplayer → Gabung**. Pembuat ruang memilih level setelah keduanya siap.

Alamat server tersimpan di browser setelah dipakai. Bila ingin semua pemain mendapat alamat otomatis tanpa tautan, atur variabel lingkungan Vercel `VITE_ROOM_SERVER_URL` ke alamat Render tadi dan lakukan redeploy. Kode frontend memakai variabel itu saat build.

Untuk **multiplayer dua laptop dalam Wi-Fi yang sama**, cukup jalankan game di laptop pertama. Tekan **Play → Multiplayer → Buat Ruang Baru**. Alamat untuk laptop teman akan muncul di layar bersama kode ruang enam karakter. Buka alamat itu di browser laptop kedua, tekan **Play → Multiplayer**, lalu masukkan kode jika belum terisi. Setelah kedua pemain siap, Raka memilih level. Posisi pemain, soal yang terpecahkan, dan berkas tersinkron langsung. Laptop pertama dan terminalnya harus tetap menyala. Bila Windows Firewall meminta izin akses Node.js untuk jaringan privat, izinkan agar laptop lain bisa terhubung. Kalau alamat otomatis tidak cocok dengan Wi-Fi yang dipakai, cari alamat IPv4 laptop pertama dengan `ipconfig`, lalu buka `http://ALAMAT-IPv4:PORT/` di laptop kedua (PORT adalah angka pada alamat Local, misalnya 5173). Mode ini untuk jaringan yang sama; bermain lewat internet berbeda jaringan memerlukan server publik.

Di komputer lain, untuk mengembangkan kodenya sendiri, pasang Node.js dari https://nodejs.org dan Visual Studio Code dari https://code.visualstudio.com. Setelah membuka folder proyek, jalankan `npm.cmd install`, lalu `npm.cmd run dev`. Pada macOS/Linux gunakan `npm` tanpa `.cmd`.

## Cara bermain

- Pada layar judul **Jejak yang Hilang**, tekan **Play**, lalu pilih **Single Player** atau **Multiplayer**. Tombol **Cara Bermain** membuka panduan.
- Dalam Single Player, level 1 terbuka sejak awal; level berikutnya terbuka setelah berkas level sebelumnya diamankan. Kemajuan level dan berkas tersimpan di browser yang sama. Dalam Multiplayer, progres berlaku selama ruang masih aktif; pembuat ruang memilih level dan kedua pemain menjadi Raka.
- Pilih kartu level untuk masuk ke arena. Nyawa, berkas, waktu, dan tombol pengaturan berada di bingkai game.
- Gerakkan Raka (Agen R) dengan tombol **← →** atau **A D**. Pada layar sentuh, tahan tombol panah di bawah arena.
- Temui Arman, Vira, Nara, atau Damar di ruangan untuk membaca percakapan, lalu dekati terminal dan tekan **E** atau tombol interaksi. Tiap soal menampilkan rumus, cara pakai, dan contoh sebelum kamu **mengetik** jawabannya. Tombol **Lihat jawaban** tersedia jika kamu ingin memeriksa hasilnya.
- Setiap area lebih panjang dan kamera mengikuti Raka. Jelajahi area untuk menemukan terminal; pintu keluar berada dekat awal sehingga kamu perlu kembali ke sana.
- Setelah menyelesaikan tiga soal terminal, baca petunjuk di atas map. Berkas tersembunyi di salah satu dari tiga tempat pemeriksaan. Dekati tempat itu dan tekan **E** untuk memeriksanya.
- Di level selanjutnya, pemindai bergantian menyala merah dan padam. Lewati saat padam.
- Jawaban salah atau terkena pemindai mengurangi nyawa. Nyawa kembali penuh pada level berikutnya.
- Level terakhir dibatasi 150 detik. Empat berkas lengkap dan paling banyak tiga kesalahan memberi True Ending. Lebih banyak kesalahan tetapi berhasil lolos memberi Neutral Ending. Kehabisan nyawa atau waktu memberi Bad Ending.
- Musik dan efek suara dimulai setelah level dimulai. Tombol suara pada layar judul dan di bingkai permainan mematikan atau menghidupkan semuanya. Tidak perlu mengunduh file musik; suaranya dibuat langsung di browser.
- Saat bermain di desktop, arena otomatis mengisi lebar dan tinggi jendela. Tombol **Layar penuh** di bagian atas menyembunyikan bilah browser; tekan lagi atau **Esc** untuk keluar. Browser hanya mengizinkan layar penuh setelah tombol ditekan.
- Tombol **Cara main** berisi panduan singkat dalam game.

## Belajar mengubah game sendiri

- `src/game.js`: judul level, dialog, rumus, tiga soal per level, jawaban, dan petunjuk. Untuk menerima lebih dari satu bentuk jawaban, tambah nilainya ke array `answers`.
- `src/main.jsx`: layar judul, mode, ruang multiplayer, gerakan pemain, interaksi terminal/berkas/pintu, pemindai, timer, dan perpindahan level.
- `server/rooms.js`, `server/index.js`, `vite.config.js`, dan `render.yaml`: ruang multiplayer WebSocket untuk jaringan lokal dan server publik.
- Setiap level di `src/game.js` juga memiliki `map` yang menentukan lokasi tokoh, terminal, pintu, pemindai, tiga tempat pencarian, dan petunjuk berkas.
- `src/style.css`: warna, tata letak, bayangan pijakan, dan efek ruangan.
- `src/audio.js`: melodi latar dan efek suara. Ubah nada dan volume di sini.
- `public/scenes/`: empat latar lokasi yang digambar sebagai SVG.
- `public/assets/`: lima lembar pose asli dari tugas. Jangan diubah jika ingin menjaga referensi.
- `public/sprites/`: bingkai transparan yang dibuat dari lembar pose untuk animasi. File bernama `r-walk-0.png` sampai `r-walk-4.png` dipakai bergantian ketika pemain bergerak.
- `scripts/make_backgrounds.py`: membuat ulang empat latar SVG.
- `scripts/make_sprites.py`: membuat ulang bingkai animasi dari lima gambar asli dan menyamakan posisi kaki semua pose. Membutuhkan Python dan Pillow bila dijalankan sendiri; gambar hasilnya sudah disertakan, jadi tidak perlu menjalankan skrip ini untuk bermain.
- `scripts/sharpen_sprites.ps1`: memperjelas tepi semua bingkai hasil ekstraksi di Windows. Jika membuat ulang sprite dengan `make_sprites.py`, jalankan `powershell -File scripts/sharpen_sprites.ps1` sekali sesudahnya.

Latihan pertama yang mudah: ganti dialog level pertama di `src/game.js`, simpan dengan **Ctrl+S**, lalu lihat perubahan di browser. Jika ingin mengubah jawaban, ubah juga `answers` pada soal yang sama.

## Catatan sumber dan penyesuaian

Dokumen: https://docs.google.com/document/d/1LpZBwe9ZpOXHaI2cfhE_YiGI-iixH2Az7DAEVTlwcfU/edit
Gambar: https://drive.google.com/drive/folders/1cGSQ76beOYFCJNnmVsfpwDb6ynEhNi1Y

Ekspor teks dokumen tidak memuat rumus lengkap. Karena itu rumus, ciphertext latihan, jumlah soal, pemindai, dan batas waktu adalah rancangan permainan yang mengikuti tema konversi alfabet, komposisi fungsi, dan fungsi invers dalam alur. Berkas sumber di folder tugas tidak diubah.

## Memeriksa hasil

- `npm.cmd test` memeriksa format jawaban, urutan tingkat kesulitan, ending, dan sinkronisasi ruang multiplayer.
- `npm.cmd run build` membuat folder `dist` untuk Single Player di hosting statis. Multiplayer membutuhkan server Node.js yang berjalan; mengunggah `dist` saja ke GitHub Pages tidak akan menyalakan ruang live.

Jangan membuka `index.html` lewat klik ganda. Jalankan game melalui Vite dengan `npm.cmd run dev`.

