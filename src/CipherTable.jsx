import React from 'react';

const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function CipherTable(){
  return <div className="cipher-grid" aria-label="Tabel huruf besar dan kecil beserta angka konversinya">
    {letters.map((letter,index)=><div className="cipher-cell" key={letter}><span>{letter}<b>{index+1}</b></span><span>{letter.toLowerCase()}<b>−{index+1}</b></span></div>)}
    <div className="cipher-cell cipher-space"><span>SPASI<b>0</b></span></div>
  </div>;
}
