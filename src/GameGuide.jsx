import React, {useState} from 'react';
import {levels} from './game';

const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GameGuide({onClose}){
  const [tab,setTab]=useState('play');

  return <div className="help-overlay">
    <section className="help-card guide-panel" role="dialog" aria-modal="true" aria-label="Panduan Jejak yang Hilang">
      <button className="close-help" onClick={onClose} aria-label="Tutup panduan">×</button>
      <p className="guide-eyebrow">PANDUAN AGEN · JEJAK YANG HILANG</p>
      <h2>Cara bermain</h2>
      <div className="guide-tabs" aria-label="Bagian panduan">
        <button className={tab==='play'?'active':''} aria-pressed={tab==='play'} onClick={()=>setTab('play')}>01 · Misi & kontrol</button>
        <button className={tab==='codes'?'active':''} aria-pressed={tab==='codes'} onClick={()=>setTab('codes')}>02 · Kode & rumus</button>
      </div>
      <div className="guide-scroll">
        {tab==='play' ? <>
          <p className="guide-lead">Bantu Raka mengejar Vira melalui empat lokasi, pecahkan kode terminal, dan kumpulkan kunci untuk membuka jalan.</p>
          <div className="guide-steps">
            <div><b>01</b><span><strong>Mulai misi</strong><small>Pilih Single Player, atau buat ruang Multiplayer dan bagikan kode ruang. Dua Raka berlomba memecahkan soal dan menemukan kunci. Di menu awal, buka Toko Karakter untuk membeli karakter dengan skill berbeda memakai koin. Setiap area punya pintu masuk di kiri dan pintu keluar di kanan.</small></span></div>
            <div><b>02</b><span><strong>Jelajahi ruangan</strong><small>Jalan dengan ← → atau A D. Energi lari mulai dari 0. Sentuh sel energi bercahaya untuk mendapat 30 energi, atau jawab soal dengan benar untuk mendapat 35. Tahan Shift untuk lari saat energinya cukup. Tekan Spasi / ↑ / W untuk lompat. Di layar sentuh gunakan panah, LARI, dan LOMPAT. Dekati tokoh, terminal, atau benda, lalu tekan E.</small></span></div>
            <div><b>03</b><span><strong>Pecahkan tiga kode</strong><small>Baca rumus dan contoh di terminal. Hitung invers untuk mengubah cipherteks menjadi angka atau huruf. Untuk pesan huruf, ketik pesan dan angka verifikasi yang dihitung dari cipherteks tambahan. Angka berganti setiap kali masuk level. Huruf besar atau kecil, spasi tambahan, dan tanda baca boleh dipakai saat menjawab; isi pesannya dan angkanya tetap harus tepat. Tabel konversinya ada di tab Kode & rumus.</small></span></div>
            <div><b>04</b><span><strong>Buka pintu keluar</strong><small>Setelah memecahkan kode, cari kunci di depan jalurmu. Pintu keluar tetap tertutup sebelum kunci diambil. Vira menunggu sebelum pintu lalu kabur saat didekati. Di level 4, lompati platform dan susul Vira untuk menang.</small></span></div>
          </div>
          <p className="guide-note">Energi lari dimulai dari 0 dan hanya bertambah dari sel energi atau jawaban benar. Koin menambah skor; sel energi bercahaya menambah sampai 30 energi lari saat disentuh. Keduanya berbunyi saat diambil. Jawaban benar menambah sampai 35 energi (45 untuk Raka Klasik) dan memberi 10–30 koin; kunci memberi 15 koin, pemenang balapan mendapat bonus 50. Raka Bayangan lebih sulit terkena laser, sedangkan Raka Taktis lebih hemat energi saat lari. Jawaban salah atau terkena pemindai mengurangi satu nyawa. Setelah terkena pemindai, kamu kembali ke awal level dengan sisa nyawa yang sama. Saat nyawa habis, single player kembali ke menu utama dan multiplayer ke menu level. Waktu level 1–4 berturut-turut 10:00, 10:30, 11:00, dan 11:30; timer berhenti saat dialog atau soal terbuka. Saat masuk level lagi, angka soal dan lokasi kunci berubah. Lebah level 3 hanya berbahaya saat bertanda aktif.</p>
        </> : <>
          <p className="guide-lead">Ubah setiap cipherteks <b>y</b> menjadi angka asli <b>x</b> dengan fungsi invers, lalu cocokkan angkanya dengan huruf.</p>
          <div className="guide-equation"><span>ATURAN DASAR</span><strong>Jika y = ax + b, maka x = (y − b) ÷ a</strong><small>Contoh: y = 2x + 1 dan y = 7 → x = (7 − 1) ÷ 2 = 3 → C.</small></div>
          <h3 className="guide-section-title">Tabel konversi huruf</h3>
          <p className="guide-caption">Huruf besar A–Z = 1 sampai 26. Huruf kecil a–z = −1 sampai −26. Angka hasil dekripsi 0 berarti spasi.</p>
          <div className="cipher-grid" aria-label="Tabel huruf besar dan kecil beserta angka konversinya">
            {letters.map((letter,index)=><div className="cipher-cell" key={letter}><span>{letter}<b>{index+1}</b></span><span>{letter.toLowerCase()}<b>−{index+1}</b></span></div>)}
            <div className="cipher-cell cipher-space"><span>SPASI<b>0</b></span></div>
          </div>
          <div className="guide-equation guide-example"><span>CONTOH PESAN BERTANDA</span><strong>11, −1, 2 dengan f(x) = 3x + 2</strong><small>Invers: x = (y − 2) ÷ 3. Hasilnya 3, −1, 0 → C a [spasi]. Nol muncul setelah dekripsi, bukan harus tertulis sebagai cipherteks.</small></div>
          <h3 className="guide-section-title">Rumus dalam setiap level</h3>
          <p className="guide-caption">Ini contoh latihan untuk memahami tiap level. Angka, rumus, dan jawaban pada terminal permainan berubah setiap kali kamu masuk level.</p>
          <div className="guide-formula-list">{levels.map((level,index)=><details key={level.name} open={index===0}><summary><span>LEVEL {String(index+1).padStart(2,'0')}</span><strong>{level.name}</strong><i aria-hidden="true">⌄</i></summary><ol>{level.puzzles.map((puzzle,puzzleIndex)=><li key={puzzle.prompt}><small>SOAL {puzzleIndex+1}</small><b>{puzzle.formula}</b><span>{puzzle.example}</span></li>)}</ol></details>)}</div>
        </>}
      </div>
      <button className="guide-done" onClick={onClose}>Mengerti →</button>
    </section>
  </div>;
}
