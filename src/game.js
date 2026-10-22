// Setiap level memiliki tiga soal. Jawaban diketik pemain, bukan pilihan ganda.
// Tambah jawaban alternatif di dalam array answers bila diperlukan.
export const levels = [
  {
    name:'Jejak yang Hilang', location:'Ruang kerja Vira', chapter:'PROLOG',
    color:'#86c8a4', npc:'chief', speaker:'Arman · Kepala Divisi',
    dialogue:[
      {who:'npc',text:'Raka! Aku menunggumu di sini. Vira menghilang setelah mengirim kode terakhirnya.'},
      {who:'r',text:'Kalau begitu, aku harus membaca jejak yang ia tinggalkan.'},
      {who:'npc',text:'Mulai dari terminal itu. Angka-angkanya mengikuti urutan huruf dalam alfabet.'}
    ],
    story:'Vira hilang setelah menemukan kebocoran data. Di ruang kerjanya ada alfabet angka dan transmisi yang terputus. Dekripsi catatan itu sebelum seseorang datang.',
    goal:'Temukan catatan Vira, pecahkan tiga kode, ambil berkas, lalu menuju pintu.',
    puzzles:[
      {prompt:'Dalam kode A = 1, B = 2, ..., Z = 26, berapa nilai huruf V?', formula:'A = 1 · B = 2 · … · Z = 26', rule:'Nilai huruf = nomor urutnya dalam alfabet.', example:'Contoh: C adalah huruf ke-3, jadi C = 3.', answers:['22'], hint:'U = 21. V tepat setelah U.', explain:'V = 22. Angka ini menjadi kunci awal transmisi.'},
      {prompt:'Ubah sinyal 18–21–14 menjadi sebuah kata.', formula:'A = 1 · B = 2 · … · Z = 26', rule:'Cari huruf pada posisi tiap angka, lalu baca dari kiri ke kanan.', example:'Contoh: 3–1–20 menjadi C–A–T.', answers:['RUN'], hint:'18 = R, 21 = U, 14 = N.', explain:'RUN. Vira menyuruhmu bergerak cepat.'},
      {prompt:'Enkripsikan kata ECHO menjadi empat angka. Pisahkan dengan tanda hubung.', formula:'A = 1 · B = 2 · … · Z = 26', rule:'Ganti setiap huruf dengan nomor urutnya; pertahankan urutannya.', example:'Contoh: CAT menjadi 3–1–20.', answers:['5-3-8-15','5 3 8 15','5,3,8,15'], hint:'E = 5, C = 3. Lanjutkan H dan O.', explain:'ECHO = 5–3–8–15. Berkas pertama berhasil dibuka.'}
    ]
  },
  {
    name:'Terminal Pengodean', location:'Koridor terminal Vira', chapter:'CHAPTER 01',
    color:'#84bdc5', npc:'v', speaker:'Vira · Hologram',
    dialogue:[
      {who:'npc',text:'Raka, kalau kau melihat hologram ini, berarti seseorang sudah mengawasiku.'},
      {who:'r',text:'Aku menemukan dua fungsi di terminal. Mana yang harus dihitung dulu?'},
      {who:'npc',text:'Kerjakan fungsi yang paling dalam lebih dahulu. Lihat baik-baik arah pemindainya.'}
    ],
    story:'Dua fungsi ditemukan. Alarm pengawas mulai menyapu koridor. Perhatikan urutan komposisi: fungsi dalam kurung dikerjakan lebih dahulu.',
    goal:'Hindari sinar pengawas dan bongkar tiga operasi komposisi.',
    puzzles:[
      {prompt:'Hitung g(f(7)).', formula:'f(x) = 2x + 3  ·  g(x) = x − 4', rule:'g(f(a)) berarti hitung f(a) dulu, lalu masukkan hasilnya ke g.', example:'Contoh: f(2) = 7, kemudian g(7) = 3.', answers:['13'], hint:'f(7) = 17, kemudian g(17) = 13.', explain:'Benar. g(f(7)) = 13.'},
      {prompt:'Hitung f(g(22)). Urutannya berbeda dari soal pertama.', formula:'f(x) = 2x + 3  ·  g(x) = x − 4', rule:'f(g(a)) berarti hitung g(a) dulu, lalu masukkan hasilnya ke f.', example:'Contoh: g(8) = 4, kemudian f(4) = 11.', answers:['39'], hint:'g(22) = 18, kemudian f(18) = 39.', explain:'Benar. f(g(22)) = 39. Komposisi tidak selalu bisa dibalik urutannya.'},
      {prompt:'Sinyal awal adalah 47. Setelah fungsi g diterapkan, angka berapa yang diterima?', formula:'g(x) = x − 4', rule:'Ganti x dengan angka awal, kemudian kurangi 4.', example:'Contoh: g(10) = 10 − 4 = 6.', answers:['43'], hint:'Hitung 47 − 4.', explain:'43. Layar berkedip: SOMEONE IS WATCHING YOU.'}
    ]
  },
  {
    name:'Pengkhianat Dalam Selubung', location:'Fasilitas data terpencil', chapter:'CHAPTER 02–03',
    color:'#c4aa76', npc:'anonim', speaker:'Nara · Sumber Anonim',
    dialogue:[
      {who:'npc',text:'Aku membawa pesan dari Vira. Tapi kau tak boleh langsung percaya padaku.'},
      {who:'r',text:'Aku akan memeriksa pesanmu dengan fungsi invers.'},
      {who:'npc',text:'Bagus. Balikkan operasi hitungnya, lalu ubah hasilnya menjadi huruf.'}
    ],
    story:'Nara mengaku membawa pesan Vira. Untuk menguji klaimnya, balikkan enkripsi dan baca nama tersembunyi. Dua pemindai melindungi server.',
    goal:'Verifikasi pesan, bongkar fungsi invers, dan temukan identitas pelaku.',
    puzzles:[
      {prompt:'Jika h(x) = 2x − 1, berapa nilai h⁻¹(43)?', formula:'h(x) = 2x − 1', rule:'Rumus invers: h⁻¹(y) = (y + 1) ÷ 2.', example:'Contoh: h⁻¹(9) = (9 + 1) ÷ 2 = 5.', answers:['22'], hint:'Untuk membalikkan h, tambah 1 lalu bagi 2.', explain:'22 = V. Pesan cocok dengan kode Vira, tetapi pengirimnya belum tentu V.'},
      {prompt:'Enkripsi lain memakai f(g(x)). Jika hasilnya 31, berapa x semula?', formula:'f(g(x)) = 2x − 5', rule:'Jika hasilnya y, balikkan: x = (y + 5) ÷ 2.', example:'Contoh: hasil 15 memberi x = (15 + 5) ÷ 2 = 10.', answers:['18'], hint:'31 = 2x − 5. Tambah 5, lalu bagi 2.', explain:'x = 18. Jejak berikutnya mengarah ke akses internal.'},
      {prompt:'Dekripsi 5–15–17–9–11 memakai h⁻¹(y) = (y + 1) / 2. Tulis nama kodenya.', formula:'h⁻¹(y) = (y + 1) ÷ 2', rule:'Balikkan tiap angka dengan rumus invers, lalu ubah angka hasilnya menjadi huruf.', example:'Contoh: kode 5 → (5 + 1) ÷ 2 = 3 → C.', answers:['CHIEF'], hint:'Hasil angka pertama 3 = C; kedua 8 = H.', explain:'CHIEF. Arman ternyata pelaku pembocoran.'}
    ]
  },
  {
    name:'Transmisi Terakhir', location:'Markas yang terkunci', chapter:'CHAPTER 04 · KLIMAKS',
    color:'#db907c', npc:'pelaku', speaker:'Damar · Penjaga Sistem',
    dialogue:[
      {who:'npc',text:'Perintah Arman: semua bukti dihapus dalam 150 detik. Kau tak akan sempat, Raka.'},
      {who:'r',text:'Aku tahu Arman dalangnya. Aku akan membuka pintu dan membawa buktinya.'},
      {who:'npc',text:'Coba saja. Aku sudah mengunci setiap lapisan dengan urutan yang berbeda.'}
    ],
    story:'Arman memanipulasi sistem. Pintu terkunci dan bukti akan dihapus. Pecahkan tiga kode berlapis dalam 150 detik, ambil bukti, lalu keluar.',
    goal:'Selesaikan tiga kode sebelum waktu habis. Pemindai aktif di dua titik.',
    puzzles:[
      {prompt:'Kode terenkripsi 42 berasal dari p(x) = 3x + 6. Berapa x?', formula:'p(x) = 3x + 6', rule:'Jika kode hasilnya y, angka awal x = (y − 6) ÷ 3.', example:'Contoh: kode 21 memberi x = (21 − 6) ÷ 3 = 5.', answers:['12'], hint:'Kurangi 6 dari 42, lalu bagi 3.', explain:'Kode lapisan pertama: 12.'},
      {prompt:'Kode 31 berasal dari q(x) = 2x − 5. Berapa x?', formula:'q(x) = 2x − 5', rule:'Jika kode hasilnya y, angka awal x = (y + 5) ÷ 2.', example:'Contoh: kode 15 memberi x = (15 + 5) ÷ 2 = 10.', answers:['18'], hint:'Tambah 5 pada 31, lalu bagi 2.', explain:'Kode lapisan kedua: 18.'},
      {prompt:'Kunci terakhir memakai q(p(x)) = 55. Berapa x? Balikkan q dahulu, lalu p.', formula:'p(x) = 3x + 6  ·  q(x) = 2x − 5', rule:'q(p(x)) = 2(3x + 6) − 5 = 6x + 7. Balikkan: x = (hasil − 7) ÷ 6.', example:'Contoh: jika hasil 13, maka x = (13 − 7) ÷ 6 = 1.', answers:['8'], hint:'q⁻¹(55) = 30. Lalu p⁻¹(30) = ?', explain:'x = 8. Pintu darurat terbuka. Kirim bukti sebelum alarm mengunci ulang.'}
    ]
  }
];
export const normalizeAnswer = value => value.trim().toUpperCase().replace(/\s*[-–—]\s*/g,'-').replace(/\s*,\s*/g,',').replace(/\s+/g,' ');
export const isCorrect = (puzzle,value) => puzzle.answers.some(answer => normalizeAnswer(answer)===normalizeAnswer(value));
export const getEnding = ({dossiers,mistakes,escaped}) => !escaped ? 'bad' : dossiers===4 && mistakes<=3 ? 'true' : 'neutral';
