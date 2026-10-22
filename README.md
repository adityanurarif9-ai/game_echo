# Project Echo — The Last Transmission

Game React dengan animasi berjalan, empat latar lokasi, musik dan efek suara, empat level, serta 12 teka-teki matematika berdasarkan dokumen **Alur Game** dan lima gambar karakter dari folder tugas.

## Cara menjalankan di laptop ini

Node.js dan Visual Studio Code sudah terpasang. React sudah terpasang di folder proyek ini.

1. Buka folder `D:\Project-Echo` di Visual Studio Code.
2. Pilih **Terminal → New Terminal**.
3. Ketik `npm.cmd run dev` lalu Enter.
4. Buka alamat **Local** yang muncul di terminal, biasanya `http://127.0.0.1:5173/`.
5. Biarkan terminal terbuka selama bermain. Untuk berhenti, tekan **Ctrl+C**.

Di komputer lain, pasang Node.js LTS dari https://nodejs.org dan Visual Studio Code dari https://code.visualstudio.com. Setelah membuka folder proyek, jalankan `npm.cmd install`, lalu `npm.cmd run dev`. Pada macOS/Linux gunakan `npm` tanpa `.cmd`.

## Cara bermain

- Gerakkan Agen R dengan tombol **← →** atau **A D**. Pada layar sentuh, tahan tombol panah di bawah arena.
- Temui tokoh di ruangan untuk membaca percakapan, lalu dekati terminal dan tekan **E** atau tombol interaksi. Tiap soal menampilkan rumus, cara pakai, dan contoh sebelum kamu **mengetik** jawabannya.
- Ambil berkas di tengah ruangan, kemudian berjalan ke pintu keluar.
- Di level selanjutnya, pemindai bergantian menyala merah dan padam. Lewati saat padam.
- Jawaban salah atau terkena pemindai mengurangi nyawa. Nyawa kembali penuh pada level berikutnya.
- Level terakhir dibatasi 150 detik. Empat berkas lengkap dan paling banyak tiga kesalahan memberi True Ending. Lebih banyak kesalahan tetapi berhasil lolos memberi Neutral Ending. Kehabisan nyawa atau waktu memberi Bad Ending.
- Musik dan efek suara dimulai setelah menekan **Mulai bermain**. Tombol **Suara nyala/mati** di bagian atas mematikan atau menghidupkan semuanya. Tidak perlu mengunduh file musik; suaranya dibuat langsung di browser.
- Tombol **Cara main** berisi panduan singkat dalam game.

## Belajar mengubah game sendiri

- `src/game.js`: judul level, dialog, rumus, tiga soal per level, jawaban, dan petunjuk. Untuk menerima lebih dari satu bentuk jawaban, tambah nilainya ke array `answers`.
- `src/main.jsx`: gerakan pemain, interaksi terminal/berkas/pintu, pemindai, timer, dan perpindahan level. React `useState` menyimpan kondisi permainan; `useEffect` menjalankan gerak dan waktu.
- `src/style.css`: warna, tata letak, bayangan pijakan, dan efek ruangan.
- `src/audio.js`: melodi latar dan efek suara. Ubah nada dan volume di sini.
- `public/scenes/`: empat latar lokasi yang digambar sebagai SVG.
- `public/assets/`: lima lembar pose asli dari tugas. Jangan diubah jika ingin menjaga referensi.
- `public/sprites/`: bingkai transparan yang dibuat dari lembar pose untuk animasi. File bernama `r-walk-0.png` sampai `r-walk-4.png` dipakai bergantian ketika pemain bergerak.
- `scripts/make_backgrounds.py`: membuat ulang empat latar SVG.
- `scripts/make_sprites.py`: membuat ulang bingkai animasi dari lima gambar asli dan menyamakan posisi kaki semua pose. Membutuhkan Python dan Pillow bila dijalankan sendiri; gambar hasilnya sudah disertakan, jadi tidak perlu menjalankan skrip ini untuk bermain.

Latihan pertama yang mudah: ganti dialog level pertama di `src/game.js`, simpan dengan **Ctrl+S**, lalu lihat perubahan di browser. Jika ingin mengubah jawaban, ubah juga `answers` pada soal yang sama.

## Catatan sumber dan penyesuaian

Dokumen: https://docs.google.com/document/d/1LpZBwe9ZpOXHaI2cfhE_YiGI-iixH2Az7DAEVTlwcfU/edit
Gambar: https://drive.google.com/drive/folders/1cGSQ76beOYFCJNnmVsfpwDb6ynEhNi1Y

Ekspor teks dokumen tidak memuat rumus lengkap. Karena itu rumus, ciphertext latihan, jumlah soal, pemindai, dan batas waktu adalah rancangan permainan yang mengikuti tema konversi alfabet, komposisi fungsi, dan fungsi invers dalam alur. Berkas sumber di folder tugas tidak diubah.

## Memeriksa hasil

- `npm.cmd test` memeriksa format jawaban, urutan tingkat kesulitan, dan ending.
- `npm.cmd run build` membuat folder `dist` untuk dipasang di hosting statis.

Jangan membuka `index.html` lewat klik ganda. Jalankan game melalui Vite dengan `npm.cmd run dev`.

