// Setiap level memiliki tiga soal. Jawaban diketik pemain, bukan pilihan ganda.
// Tambah jawaban alternatif di dalam array answers bila diperlukan.
export const levels = [
  {
    name:'Jejak yang Hilang', location:'Ruang kerja Vira', chapter:'PROLOG',
    color:'#86c8a4', npc:'chief', speaker:'Arman · Kepala Divisi',
    dialogue:[
      {who:'npc',text:'Raka! Aku menunggumu di sini. Vira menghilang setelah mengirim kode terakhirnya.'},
      {who:'r',text:'Kalau begitu, aku harus membaca jejak yang ia tinggalkan.'},
      {who:'npc',text:'Mulai dari terminal itu. Balikkan fungsi enkripsinya, lalu cocokkan angka dengan huruf.'}
    ],
    story:'Vira hilang setelah menemukan kebocoran data. Di ruang kerjanya ada fungsi enkripsi dan transmisi yang terputus. Balikkan kode itu sebelum seseorang datang.',
    goal:'Jelajahi kantor Vira, pecahkan kode terminal, lalu cari berkas di tempat tersembunyi.',
    map:{npc:14,terminal:73,door:3,scanners:[],caches:[{x:31,name:'Loker arsip'},{x:51,name:'Meja bukti'},{x:89,name:'Rak buku'}],hidden:2,clue:'Vira menulis: "Yang dicari bersembunyi di antara buku-buku, jauh dari meja kerjaku."'},
    puzzles:[
      {prompt:'Fungsi enkripsi f(x) = 2x + 3 menghasilkan cipherteks 5. Berapa nilai plainteks x?', formula:'f(x) = 2x + 3 · f⁻¹(y) = (y − 3) ÷ 2', rule:'Kurangi cipherteks dengan 3, lalu bagi 2.', example:'Contoh: jika cipherteks 9, plainteksnya (9 − 3) ÷ 2 = 3.', answers:['1'], hint:'(5 − 3) ÷ 2 = ?', explain:'Plainteksnya 1. Jejak pertama Vira berhasil dibaca.'},
      {prompt:'Dengan f(x) = 2x + 1, dekripsi 31–37–3–29–15 menjadi satu kata.', formula:'f⁻¹(y) = (y − 1) ÷ 2 · A = 1 sampai Z = 26', rule:'Balikkan tiap angka, lalu ubah hasilnya menjadi huruf kapital.', example:'Contoh: 7 → (7 − 1) ÷ 2 = 3 → C.', answers:['ORANG'], hint:'31 → 15 = O. Lanjutkan setiap angka dari kiri ke kanan.', explain:'ORANG. Vira memberi tanda bahwa ada seseorang di balik kebocoran.'},
      {prompt:'Dengan f(x) = 3x + 2, dekripsi 26–29–38–5–44–23 menjadi satu kata.', formula:'f⁻¹(y) = (y − 2) ÷ 3 · A = 1 sampai Z = 26', rule:'Hitung invers untuk tiap angka, lalu baca huruf sesuai urutannya.', example:'Contoh: 11 → (11 − 2) ÷ 3 = 3 → C.', answers:['HILANG'], hint:'26 → 8 = H, 29 → 9 = I.', explain:'HILANG. Pesan ini menguatkan bahwa Vira sengaja meninggalkan jejak.'}
    ]
  },
  {
    name:'Terminal Pengodean', location:'Koridor terminal Vira', chapter:'CHAPTER 01',
    color:'#84bdc5', npc:'v', speaker:'Vira · Hologram',
    dialogue:[
      {who:'npc',text:'Raka, kalau kau melihat hologram ini, berarti seseorang sudah mengawasiku.'},
      {who:'r',text:'Aku menemukan dua fungsi di terminal. Mana yang harus dihitung dulu?'},
      {who:'npc',text:'Uraikan dulu fungsi gandanya, lalu gunakan invers. Lihat baik-baik arah pemindainya.'}
    ],
    story:'Fungsi enkripsi berlapis ditemukan. Alarm pengawas mulai menyapu koridor. Uraikan fungsi di dalam kurung lebih dahulu sebelum membalikkan hasilnya.',
    goal:'Jelajahi koridor panjang, hindari pemindai, dan ikuti petunjuk berkas.',
    map:{npc:18,terminal:82,door:3,scanners:[45,68],caches:[{x:29,name:'Kotak peralatan'},{x:55,name:'Panel listrik'},{x:92,name:'Lemari keamanan'}],hidden:1,clue:'Sinyal Vira menunjuk sumber daya di tengah koridor, bukan lemari di ujung.'},
    puzzles:[
      {prompt:'Enkripsi f(x) = 3(2x + 1) − 4. Dekripsi 119–29–77–125–65–5–83 menjadi satu kata.', formula:'f(x) = 6x − 1 · f⁻¹(y) = (y + 1) ÷ 6', rule:'Hitung invers tiap angka, lalu cocokkan A = 1 sampai Z = 26.', example:'Contoh: 17 → (17 + 1) ÷ 6 = 3 → C.', answers:['TEMUKAN'], hint:'119 → 20 = T; 29 → 5 = E.', explain:'TEMUKAN. Vira meminta Raka mencari bukti yang disembunyikan.'},
      {prompt:'Enkripsi f(x) = 4(3x − 2) + 5 menghasilkan cipherteks 141. Berapa plainteks x?', formula:'f(x) = 12x − 3 · f⁻¹(y) = (y + 3) ÷ 12', rule:'Uraikan kurung lebih dahulu, lalu balikkan fungsi.', example:'Contoh: jika hasilnya 33, maka x = (33 + 3) ÷ 12 = 3.', answers:['12'], hint:'(141 + 3) ÷ 12 = ?', explain:'x = 12. Lapisan kedua terminal terbuka.'},
      {prompt:'Enkripsi f(x) = 4(2x − 3) + 5. Dekripsi 81–161–105–17–65 menjadi satu kata.', formula:'f(x) = 8x − 7 · f⁻¹(y) = (y + 7) ÷ 8', rule:'Balikkan setiap cipherteks lalu ubah hasilnya ke huruf A = 1 sampai Z = 26.', example:'Contoh: 17 → (17 + 7) ÷ 8 = 3 → C.', answers:['KUNCI'], hint:'81 → 11 = K; 161 → 21 = U.', explain:'KUNCI. Pesan berikutnya menyimpan petunjuk pembuka akses.'}
    ]
  },
  {
    name:'Pengkhianat Dalam Selubung', location:'Fasilitas data terpencil', chapter:'CHAPTER 02–03',
    color:'#c4aa76', npc:'anonim', speaker:'Nara · Sumber Anonim',
    dialogue:[
      {who:'npc',text:'Aku membawa pesan dari Vira. Tapi kau tak boleh langsung percaya padaku.'},
      {who:'r',text:'Aku akan memeriksa pesanmu dengan fungsi invers.'},
      {who:'npc',text:'Bagus. Angka positif berarti huruf besar, negatif huruf kecil, dan nol adalah spasi.'}
    ],
    story:'Nara mengaku membawa pesan Vira. Untuk menguji klaimnya, balikkan enkripsi dan baca pesan tersembunyi. Dua pemindai melindungi server.',
    goal:'Periksa ruang server, bongkar fungsi invers, dan ikuti petunjuk tentang Vira.',
    map:{npc:32,terminal:77,door:3,scanners:[42,71],caches:[{x:15,name:'Rak server A'},{x:49,name:'Inti data'},{x:91,name:'Rak server D'}],hidden:0,clue:'Jejak akses tertua berasal dari rak pertama, dekat pintu masuk.'},
    puzzles:[
      {prompt:'Dekripsi 11, −1, −52, −25, 2, −4, −13, −52, −31, −1, −55. Pesan lokasi berkas apa yang muncul?', formula:'f(x) = 3x + 2 · f⁻¹(y) = (y − 2) ÷ 3', rule:'Positif: huruf besar A=1–Z=26. Negatif: huruf kecil a=−1–z=−26. Nol: spasi.', example:'11 → (11 − 2) ÷ 3 = 3 → C; −1 → −1 → a.', answers:['CARI BERKAS'], hint:'Hasil awalnya 3, −1, −18, −9, 0.', explain:'Cari berkas. Petunjuk Vira ternyata tersembunyi dalam angka bertanda.'},
      {prompt:'Dekripsi 14, −25, 2, −10, −13, −46, −1, −40. Ke mana arah pelarian Vira?', formula:'f⁻¹(y) = (y − 2) ÷ 3', rule:'Balikkan tiap angka. Positif = huruf besar, negatif = huruf kecil, 0 = spasi.', example:'14 → 4 → D; −25 → −9 → i.', answers:['DI DEPAN'], hint:'Dua huruf pertama membentuk “Di”.', explain:'Di depan. Raka harus mencari jalan melalui bagian depan fasilitas.'},
      {prompt:'Dekripsi −37, 17, −40, −19, 26, −25, −34, −1, −40, 23. Apa yang terjadi pada Vira?', formula:'f⁻¹(y) = (y − 2) ÷ 3', rule:'Ubah hasil invers menjadi huruf; tanda minus menentukan huruf kecil.', example:'17 → 5 → E; −40 → −14 → n.', answers:['MENGHILANG'], hint:'Pesan dimulai dengan “mEn…”.', explain:'mEngHilanG. Vira memang menghilang. Rekaman akses yang ditinggalkannya juga menunjukkan nama Arman.'}
    ]
  },
  {
    name:'Transmisi Terakhir', location:'Markas yang terkunci', chapter:'CHAPTER 04 · KLIMAKS',
    color:'#db907c', npc:'pelaku', speaker:'Damar · Penjaga Sistem',
    dialogue:[
      {who:'npc',text:'Perintah Arman: semua bukti dihapus dalam 150 detik. Kau tak akan sempat, Raka.'},
      {who:'r',text:'Aku tahu Arman dalangnya. Aku akan membuka pintu dan membawa buktinya.'},
      {who:'npc',text:'Coba saja. Kode terakhir memakai komposisi dua fungsi. Balikkan urutannya kalau bisa.'}
    ],
    story:'Arman memanipulasi sistem. Pintu terkunci dan bukti akan dihapus. Pecahkan tiga pesan komposisi dalam 150 detik, ambil bukti, lalu keluar.',
    goal:'Cari bukti terakhir dan kembali ke pintu sebelum sistem menghapus semuanya.',
    map:{npc:22,terminal:79,door:3,scanners:[40,65],caches:[{x:34,name:'Panel rusak'},{x:56,name:'Kontainer darurat'},{x:91,name:'Brankas cadangan'}],hidden:2,clue:'Catatan Arman: salinan terakhir disimpan paling jauh dari pintu darurat.'},
    puzzles:[
      {prompt:'Dekripsi 53, −3, 77, −35, 33, 1, 53, −19, 57, −11, −3, 73, −35. Apa status pencarian Raka?', formula:'f(x)=2x−1 · g(x)=2x+3 · h(x)=g(f(x))=4x+1 · h⁻¹(y)=(y−1)÷4', rule:'Positif = huruf besar, negatif = huruf kecil, 0 = spasi.', example:'53 → 13 → M; −3 → −1 → a.', answers:['MASIH MENCARI'], hint:'Pesan dimulai dengan “MaSiH”.', explain:'MaSiH MeNcARi. Laporan Raka berhasil dikirim.'},
      {prompt:'Dekripsi 17, −35, −51, −3, −55, −3. Apa pertanyaan balasan Kepala Divisi?', formula:'h⁻¹(y) = (y − 1) ÷ 4', rule:'Gunakan invers komposisi, lalu baca huruf bertanda seperti pada level sebelumnya.', example:'17 → 4 → D; −35 → −9 → i.', answers:['DIMANA'], hint:'Huruf awalnya “Di”.', explain:'Dimana. Balasan itu membuat Raka makin curiga pada Kepala Divisi.'},
      {prompt:'Dekripsi 45, −83, −55, −11, −35, 1, 5, −15, −3, 1, 17, −35, 1, 77, −35, −55, −35. Apa petunjuk akhir Vira?', formula:'h(x) = 4x + 1 · h⁻¹(y) = (y − 1) ÷ 4', rule:'Balikkan semua angka; 0 memisahkan kata dalam pesan.', example:'45 → 11 → K; −83 → −21 → u; −55 → −14 → n.', answers:['KUNCI ADA DI SINI'], hint:'Kata pertama dibaca “Kunci”.', explain:'Kunci Ada Di Sini. Raka menemukan lokasi bukti terakhir sebelum sistem terkunci.'}
    ]
  }
];
export const normalizeAnswer = value => value.trim().toUpperCase().replace(/\s*[-–—]\s*/g,'-').replace(/\s*,\s*/g,',').replace(/\s+/g,' ');
export const isCorrect = (puzzle,value) => puzzle.answers.some(answer => normalizeAnswer(answer)===normalizeAnswer(value));
export const getEnding = ({dossiers,mistakes,escaped}) => !escaped ? 'bad' : dossiers===4 && mistakes<=3 ? 'true' : 'neutral';
