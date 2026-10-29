// Setiap level memiliki tiga soal. Jawaban diketik pemain, bukan pilihan ganda.
// Tambah jawaban alternatif di dalam array answers bila diperlukan.
export const levels = [
  {
    name:'Jejak yang Hilang', location:'Ruang kerja Vira', chapter:'PROLOG',
    dossier:{title:'Kunci ruang arsip',code:'ECHO-01',detail:'Kunci pertama membuka jalur ke koridor tempat Vira berlari.'},
    color:'#86c8a4', npc:'chief', speaker:'Arman · Kepala Divisi',
    dialogue:[
      {who:'npc',text:'Raka! Vira baru saja berlari ke pintu ujung ruangan setelah mengirim kode terakhirnya.'},
      {who:'r',text:'Kalau begitu, aku harus membaca jejak yang ia tinggalkan.'},
      {who:'npc',text:'Mulai dari terminal itu. Balikkan fungsi enkripsinya, lalu cocokkan angka dengan huruf.'}
    ],
    story:'Vira kabur setelah menemukan kebocoran data. Di ruang kerjanya ada fungsi enkripsi dan transmisi yang terputus. Balikkan kode itu dan cari kunci sebelum ia jauh.',
    goal:'Pecahkan kode, temukan kunci di rak, lalu susul Vira ke pintu di ujung ruangan.',
    map:{npc:14,terminal:73,vira:86,door:97,scanners:[],caches:[{x:31,name:'Loker arsip',kind:'locker'},{x:51,name:'Meja bukti',kind:'desk'},{x:89,name:'Rak buku',kind:'bookshelf'}],hidden:2,clue:'Kunci pintu tersembunyi di antara buku-buku, jauh dari meja kerja Vira.'},
    puzzles:[
      {prompt:'Fungsi enkripsi f(x) = 2x + 3 menghasilkan cipherteks 5. Berapa nilai plainteks x?', formula:'f(x) = 2x + 3 · f⁻¹(y) = (y − 3) ÷ 2', rule:'Kurangi cipherteks dengan 3, lalu bagi 2.', example:'Contoh: jika cipherteks 9, plainteksnya (9 − 3) ÷ 2 = 3.', answers:['1'], hint:'(5 − 3) ÷ 2 = ?', explain:'Plainteksnya 1. Jejak pertama Vira berhasil dibaca.'},
      {prompt:'Dengan f(x) = 2x + 1, dekripsi 31–37–3–29–15 menjadi satu kata.', formula:'f⁻¹(y) = (y − 1) ÷ 2 · A = 1 sampai Z = 26', rule:'Balikkan tiap angka, lalu ubah hasilnya menjadi huruf kapital.', example:'Contoh: 7 → (7 − 1) ÷ 2 = 3 → C.', answers:['ORANG'], hint:'31 → 15 = O. Lanjutkan setiap angka dari kiri ke kanan.', explain:'ORANG. Vira memberi tanda bahwa ada seseorang di balik kebocoran.'},
      {prompt:'Dengan f(x) = 3x + 2, dekripsi 26–29–38–5–44–23 menjadi satu kata.', formula:'f⁻¹(y) = (y − 2) ÷ 3 · A = 1 sampai Z = 26', rule:'Hitung invers untuk tiap angka, lalu baca huruf sesuai urutannya.', example:'Contoh: 11 → (11 − 2) ÷ 3 = 3 → C.', answers:['HILANG'], hint:'26 → 8 = H, 29 → 9 = I.', explain:'HILANG. Pesan ini menguatkan bahwa Vira sengaja meninggalkan jejak.'}
    ]
  },
  {
    name:'Terminal Pengodean', location:'Koridor terminal Vira', chapter:'CHAPTER 01',
    dossier:{title:'Kunci akses koridor',code:'ECHO-02',detail:'Kunci kedua membuka jalur keluar dari koridor pengawasan.'},
    color:'#84bdc5', npc:'v', speaker:'Vira · Hologram',
    dialogue:[
      {who:'npc',text:'Raka, kalau kau melihat hologram ini, berarti seseorang sudah mengawasiku.'},
      {who:'r',text:'Aku menemukan dua fungsi di terminal. Mana yang harus dihitung dulu?'},
      {who:'npc',text:'Uraikan dulu fungsi gandanya, lalu gunakan invers. Lihat baik-baik arah pemindainya.'}
    ],
    story:'Fungsi enkripsi berlapis ditemukan. Alarm pengawas mulai menyapu koridor. Uraikan fungsi di dalam kurung lebih dahulu sebelum membalikkan hasilnya.',
    goal:'Hindari pemindai, cari kunci tersembunyi, lalu ikuti Vira ke pintu di ujung koridor.',
    map:{npc:18,terminal:72,vira:87,door:97,scanners:[45,68],caches:[{x:29,name:'Kotak peralatan',kind:'toolbox'},{x:55,name:'Panel listrik',kind:'panel'},{x:92,name:'Lemari keamanan',kind:'cabinet'}],hidden:1,clue:'Kunci berada di panel listrik tengah koridor, bukan lemari di ujung.'},
    puzzles:[
      {prompt:'Enkripsi f(x) = 3(2x + 1) − 4. Dekripsi 119–29–77–125–65–5–83 menjadi satu kata.', formula:'f(x) = 6x − 1 · f⁻¹(y) = (y + 1) ÷ 6', rule:'Hitung invers tiap angka, lalu cocokkan A = 1 sampai Z = 26.', example:'Contoh: 17 → (17 + 1) ÷ 6 = 3 → C.', answers:['TEMUKAN'], hint:'119 → 20 = T; 29 → 5 = E.', explain:'TEMUKAN. Vira meminta Raka mencari bukti yang disembunyikan.'},
      {prompt:'Enkripsi f(x) = 4(3x − 2) + 5 menghasilkan cipherteks 141. Berapa plainteks x?', formula:'f(x) = 12x − 3 · f⁻¹(y) = (y + 3) ÷ 12', rule:'Uraikan kurung lebih dahulu, lalu balikkan fungsi.', example:'Contoh: jika hasilnya 33, maka x = (33 + 3) ÷ 12 = 3.', answers:['12'], hint:'(141 + 3) ÷ 12 = ?', explain:'x = 12. Lapisan kedua terminal terbuka.'},
      {prompt:'Enkripsi f(x) = 4(2x − 3) + 5. Dekripsi 81–161–105–17–65 menjadi satu kata.', formula:'f(x) = 8x − 7 · f⁻¹(y) = (y + 7) ÷ 8', rule:'Balikkan setiap cipherteks lalu ubah hasilnya ke huruf A = 1 sampai Z = 26.', example:'Contoh: 17 → (17 + 7) ÷ 8 = 3 → C.', answers:['KUNCI'], hint:'81 → 11 = K; 161 → 21 = U.', explain:'KUNCI. Pesan berikutnya menyimpan petunjuk pembuka akses.'}
    ]
  },
  {
    name:'Pengkhianat Dalam Selubung', location:'Fasilitas data terpencil', chapter:'CHAPTER 02–03',
    dossier:{title:'Kunci ruang server',code:'ECHO-03',detail:'Kunci ketiga membuka jalur menuju markas terakhir Vira.'},
    color:'#c4aa76', npc:'anonim', speaker:'Nara · Sumber Anonim',
    dialogue:[
      {who:'npc',text:'Aku membawa pesan dari Vira. Tapi kau tak boleh langsung percaya padaku.'},
      {who:'r',text:'Aku akan memeriksa pesanmu dengan fungsi invers.'},
      {who:'npc',text:'Bagus. Angka positif berarti huruf besar, negatif huruf kecil, dan nol adalah spasi.'}
    ],
    story:'Nara mengaku membawa pesan Vira. Untuk menguji klaimnya, naik tangga server bertingkat, lewati drone patroli, lalu balikkan enkripsi pada terminal di atas.',
    goal:'Lompati tangga server, ambil kunci, lalu kejar Vira ke pintu paling kanan.',
    map:{npc:32,terminal:77,vira:88,door:97,scanners:[42,71],caches:[{x:15,name:'Rak server A',kind:'server'},{x:49,name:'Inti data',kind:'core'},{x:91,name:'Rak server D',kind:'server'}],hidden:0,clue:'Kunci ada di rak server pertama, dekat tempat Raka masuk.'},
    puzzles:[
      {prompt:'Dekripsi 11, −1, −52, −25, 2, −31, −61, −40, −7, −25. Pesan lokasi kunci apa yang muncul?', formula:'f(x) = 3x + 2 · f⁻¹(y) = (y − 2) ÷ 3', rule:'Positif: huruf besar A=1–Z=26. Negatif: huruf kecil a=−1–z=−26. Nol: spasi.', example:'11 → (11 − 2) ÷ 3 = 3 → C; −1 → −1 → a.', answers:['CARI KUNCI'], hint:'Hasil awalnya 3, −1, −18, −9, 0.', explain:'Cari kunci. Pesan Vira ternyata tersembunyi dalam angka bertanda.'},
      {prompt:'Dekripsi 14, −25, 2, −10, −13, −46, −1, −40. Ke mana arah pelarian Vira?', formula:'f⁻¹(y) = (y − 2) ÷ 3', rule:'Balikkan tiap angka. Positif = huruf besar, negatif = huruf kecil, 0 = spasi.', example:'14 → 4 → D; −25 → −9 → i.', answers:['DI DEPAN'], hint:'Dua huruf pertama membentuk “Di”.', explain:'Di depan. Raka harus mencari jalan melalui bagian depan fasilitas.'},
      {prompt:'Dekripsi −37, 17, −40, −19, 26, −25, −34, −1, −40, 23. Apa yang terjadi pada Vira?', formula:'f⁻¹(y) = (y − 2) ÷ 3', rule:'Ubah hasil invers menjadi huruf; tanda minus menentukan huruf kecil.', example:'17 → 5 → E; −40 → −14 → n.', answers:['MENGHILANG'], hint:'Pesan dimulai dengan “mEn…”.', explain:'mEngHilanG. Vira memang menghilang. Rekaman akses yang ditinggalkannya juga menunjukkan nama Arman.'}
    ]
  },
  {
    name:'Transmisi Terakhir', location:'Markas yang terkunci', chapter:'CHAPTER 04 · KLIMAKS',
    dossier:{title:'Kunci transmisi Vira',code:'ECHO-04',detail:'Kunci terakhir membuka jalur pengejaran menuju Vira.'},
    color:'#db907c', npc:'pelaku', speaker:'Damar · Penjaga Sistem',
    dialogue:[
      {who:'npc',text:'Perintah Arman: sistem akan menghapus jejak Vira. Kau tak akan sempat mengejarnya, Raka.'},
      {who:'r',text:'Aku tahu Arman dalangnya. Aku akan membuka pintu dan membawa buktinya.'},
      {who:'npc',text:'Coba saja. Kode terakhir memakai komposisi dua fungsi. Balikkan urutannya kalau bisa.'}
    ],
    story:'Arman mengunci markas. Pecahkan pesan terakhir, ambil kunci, lalu kejar Vira melewati panggung bertingkat sebelum ia menghilang lagi.',
    goal:'Ambil kunci, lompati platform markas, dan susul Vira untuk menuntaskan misi.',
    map:{npc:22,terminal:64,vira:80,door:97,scanners:[39,72],caches:[{x:34,name:'Panel rusak',kind:'broken-panel'},{x:56,name:'Kontainer darurat',kind:'container'},{x:91,name:'Brankas cadangan',kind:'safe'}],hidden:1,clue:'Kunci transmisi ada di kontainer darurat di tengah jalur bertingkat.'},
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

// Koin berada di jalur yang benar-benar bisa dijangkau pemain. Tinggi diukur dari lantai.
export const coinTrails = [
  [{x:22,height:29},{x:35,height:29},{x:47,height:29},{x:59,height:29},{x:69,height:29},{x:81,height:29},{x:92,height:29}],
  [{x:23,height:29},{x:34,height:29},{x:51,height:29},{x:61,height:29},{x:74,height:29},{x:87,height:29},{x:94,height:29}],
  [{x:21,height:29},{x:33,height:29},{x:42,height:73},{x:54,height:117},{x:67,height:157},{x:79,height:117},{x:91,height:29}],
  [{x:16,height:29},{x:33,height:73},{x:48,height:117},{x:62,height:157},{x:76,height:117},{x:87,height:73},{x:94,height:29}]
];

export const tierPlatforms=[
  {start:37,end:49,height:44},
  {start:49,end:61,height:88},
  {start:61,end:73,height:128},
  {start:73,end:86,height:88}
];
export const finalPlatforms=[
  {start:29,end:43,height:44},
  {start:43,end:57,height:88},
  {start:57,end:71,height:128},
  {start:71,end:84,height:88},
  {start:84,end:94,height:44}
];
export const floorHeightAt=(level,x)=>(level===2?tierPlatforms:level===3?finalPlatforms:[]).find(step=>x>=step.start&&x<step.end)?.height??0;
export const canEnterAtHeight=(level,x,height)=>floorHeightAt(level,x)<=height+8;
export const advanceVira=x=>Math.min(92,x+.12);
export const catchesVira=(rakaX,rakaHeight,viraX)=>Math.abs(rakaX-viraX)<2.4&&Math.abs(rakaHeight-floorHeightAt(3,viraX))<43;
