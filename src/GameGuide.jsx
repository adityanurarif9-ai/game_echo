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
          <p className="guide-lead">Bantu Raka mengikuti jejak Vira, membuka terminal, dan membawa pulang bukti kebocoran data.</p>
          <div className="guide-steps">
            <div><b>01</b><span><strong>Mulai misi</strong><small>Pilih Single Player, atau buat ruang Multiplayer dan kirim kodenya ke teman pada jaringan yang sama. Dua Raka berlomba menyelesaikan soal dan membawa berkas ke pintu keluar. Level berikutnya terbuka setelah balapan selesai.</small></span></div>
            <div><b>02</b><span><strong>Jelajahi ruangan</strong><small>Jalan dengan ← → atau A D. Tahan Shift untuk lari, tekan Spasi / ↑ / W untuk lompat. Di layar sentuh gunakan tombol panah, LARI, dan LOMPAT. Dekati tokoh, terminal, atau benda, lalu tekan E.</small></span></div>
            <div><b>03</b><span><strong>Pecahkan tiga kode</strong><small>Baca rumus dan contoh di terminal. Hitung invers untuk mengubah cipherteks menjadi angka atau huruf. Tabel konversinya ada di tab Kode & rumus.</small></span></div>
            <div><b>04</b><span><strong>Amankan berkas</strong><small>Ambil koin di sepanjang jalur (+5 per koin), ikuti petunjuk berkas, dan hindari pemindai merah. Di level 3, lompat naik tangga bertingkat dan lewati drone patroli. Setelah menemukan berkas, kembali ke pintu keluar.</small></span></div>
          </div>
          <p className="guide-note">Jawaban cepat memberi lebih banyak koin. Setiap jawaban benar memberi 10–30 koin, berkas memberi 15, dan pemenang balapan mendapat bonus 50. Jawaban salah atau terkena pemindai mengurangi nyawa. Jika terkena pemindai, level dimulai lagi dari awal. Level terakhir dibatasi 150 detik.</p>
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
          <p className="guide-caption">Buka level yang ingin dipelajari. Rumus dan contoh yang sama juga muncul saat kamu membuka soal di terminal.</p>
          <div className="guide-formula-list">{levels.map((level,index)=><details key={level.name} open={index===0}><summary><span>LEVEL {String(index+1).padStart(2,'0')}</span><strong>{level.name}</strong><i aria-hidden="true">⌄</i></summary><ol>{level.puzzles.map((puzzle,puzzleIndex)=><li key={puzzle.prompt}><small>SOAL {puzzleIndex+1}</small><b>{puzzle.formula}</b><span>{puzzle.example}</span></li>)}</ol></details>)}</div>
        </>}
      </div>
      <button className="guide-done" onClick={onClose}>Mengerti →</button>
    </section>
  </div>;
}
