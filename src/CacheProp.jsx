import React from 'react';

const edge='#8ca9a6';
const dark='#112b37';

export default function CacheProp({kind}){
  let object;
  if(kind==='locker'||kind==='cabinet'){
    const secure=kind==='cabinet';
    object=<>
      <rect x="29" y="14" width="82" height="144" rx="5" fill={dark} stroke={edge} strokeWidth="5"/>
      <rect x="35" y="21" width="69" height="128" rx="2" fill={secure?'#314854':'#46656a'} stroke="#708c8c" strokeWidth="2"/>
      <path d="M69 22v126" stroke="#9ab4ad" strokeWidth="3"/>
      <path d="M41 35h20M78 35h20M41 42h20M78 42h20" stroke="#9cbab4" strokeWidth="2" opacity=".65"/>
      <rect x="52" y="83" width="6" height="21" rx="2" fill="#d4c796"/>
      <rect x="81" y="83" width="6" height="21" rx="2" fill="#d4c796"/>
      {secure&&<><rect x="89" y="63" width="10" height="14" rx="2" fill="#172c35" stroke="#a9bdb0"/><circle cx="94" cy="67" r="1.6" fill="#a8e6c1"/><path d="M89 72h10" stroke="#b4a685" strokeWidth="1.5"/><path d="M29 54h-6v29h6" fill="#b2976e"/></>}
      <path d="M33 155h21v6H32M87 155h21v6H87" fill="#203943"/>
    </>;
  }else if(kind==='bookshelf'){
    object=<>
      <rect x="22" y="10" width="96" height="150" rx="4" fill="#18313a" stroke="#88aaa0" strokeWidth="5"/>
      <rect x="29" y="17" width="82" height="133" fill="#233e43"/>
      {[55,100,146].map(y=><path key={y} d={`M27 ${y}h86`} stroke="#a3b9a1" strokeWidth="5"/>)}
      {[[34,31,9,23,'#b17f68'],[47,27,10,27,'#c5a46d'],[62,36,8,18,'#7c9b9b'],[75,24,11,30,'#9d7870'],[91,34,9,20,'#b9bd9a'],[32,68,10,30,'#b89873'],[47,74,9,24,'#78989c'],[60,65,12,33,'#ac7b66'],[79,72,9,26,'#b8a575'],[93,66,11,32,'#6e91a0'],[33,111,9,32,'#7e9a92'],[47,118,10,25,'#c09872'],[62,109,8,34,'#a9847e'],[76,116,11,27,'#c1b27d'],[92,108,10,35,'#78969d']].map(([x,y,w,h,color],index)=><rect key={index} x={x} y={y} width={w} height={h} rx="1" fill={color}/>)}
      <path d="M25 159h22v5H25m68-5h22v5H93" fill="#18313a"/>
    </>;
  }else if(kind==='desk'){
    object=<>
      <path d="M16 70h108l8 13H9z" fill="#b29b76" stroke="#d7c9a2" strokeWidth="3"/>
      <path d="M21 82h98v65H21z" fill="#314b50" stroke="#708b86" strokeWidth="4"/>
      <rect x="27" y="89" width="35" height="49" fill="#213a41" stroke="#78948e" strokeWidth="2"/>
      {[97,115].map(y=><g key={y}><path d={`M31 ${y}h27`} stroke="#78948e" strokeWidth="2"/><path d={`M42 ${y-4}h7`} stroke="#d4c49b" strokeWidth="2"/></g>)}
      <rect x="72" y="88" width="40" height="48" rx="2" fill="#4a6567" stroke="#8ca6a0" strokeWidth="2"/>
      <path d="M17 146h15v15H17m91-15h15v15h-15" fill="#223944"/>
      <path d="M40 61l27-6 5 14-29 2z" fill="#e1d5b7"/><path d="M67 59l31 2-3 10H70z" fill="#cad9d0"/>
      <path d="M48 62l17-3M75 64l16 1" stroke="#9d9b84" strokeWidth="1.4"/>
    </>;
  }else if(kind==='toolbox'){
    object=<>
      <path d="M45 76v-11c0-5 4-8 9-8h31c5 0 9 3 9 8v11" fill="none" stroke="#c0b79a" strokeWidth="6"/>
      <path d="M22 91h96l-7 59H29z" fill="#8e6753" stroke="#d3a785" strokeWidth="4"/>
      <path d="M19 79h102v23H19z" fill="#af8264" stroke="#deb395" strokeWidth="4"/>
      <path d="M24 103h92" stroke="#5b4b43" strokeWidth="4"/>
      <rect x="62" y="93" width="16" height="22" rx="2" fill="#d4c28f" stroke="#66594b" strokeWidth="2"/>
      <path d="M31 147h14v10H31m64-10h14v10H95" fill="#50433f"/>
    </>;
  }else if(kind==='panel'||kind==='broken-panel'){
    const broken=kind==='broken-panel';
    object=<>
      <path d="M57 120v36m25-36v36" stroke="#45616a" strokeWidth="10"/>
      <rect x="25" y="14" width="91" height="119" rx="6" fill="#263f4a" stroke="#8baaa3" strokeWidth="5"/>
      <rect x="33" y="23" width="75" height="76" rx="3" fill={broken?'#383e42':'#173c45'} stroke="#7aa199" strokeWidth="2"/>
      {broken?<><path d="M44 31l20 15-9 13 24 14-8 20M90 30l-15 20 18 12-9 24" fill="none" stroke="#b4aaa1" strokeWidth="2"/><path d="M39 79l14-12" stroke="#d1a082" strokeWidth="3"/></>:<><path d="M41 40h54M41 49h40M41 58h47" stroke="#83d9bc" strokeWidth="3" opacity=".8"/><path d="M42 76h49" stroke="#d5bd88" strokeWidth="4"/></>}
      <circle cx="45" cy="112" r="5" fill={broken?'#c1836f':'#a0d6b4'}/><circle cx="66" cy="112" r="5" fill="#b8b48c"/><circle cx="88" cy="112" r="5" fill="#577e7c"/>
      <path d="M49 156h42" stroke="#9cae9f" strokeWidth="6"/>
    </>;
  }else if(kind==='server'){
    object=<>
      <rect x="25" y="8" width="90" height="151" rx="5" fill="#142936" stroke="#75959b" strokeWidth="5"/>
      {[22,49,76,103,130].map((y,index)=><g key={y}><rect x="34" y={y} width="72" height="20" rx="2" fill={index%2?'#3a5961':'#2c4953'} stroke="#6d8b8b" strokeWidth="2"/><path d={`M42 ${y+7}h32M42 ${y+12}h26`} stroke="#a0c6b7" strokeWidth="2"/><circle cx="93" cy={y+10} r="3" fill={index===3?'#d8bc7d':'#82dec0'}/></g>)}
      <path d="M31 158h21v6H31m57-6h21v6H88" fill="#1a303b"/>
    </>;
  }else if(kind==='core'){
    object=<>
      <path d="M25 130h90l9 26H16z" fill="#233e4c" stroke="#7c9d9f" strokeWidth="4"/>
      <path d="M43 17h54l12 110H31z" fill="#213c4a" stroke="#8aa5a4" strokeWidth="4"/>
      <path d="M50 26h40l8 89H42z" fill="#15515a" stroke="#8ae1cc" strokeWidth="2"/>
      <path d="M70 31v77M49 67h42" stroke="#83ead0" strokeWidth="4" opacity=".8"/>
      <circle cx="70" cy="68" r="17" fill="none" stroke="#b9d7a8" strokeWidth="4"/>
      <path d="M35 140h70" stroke="#bac497" strokeWidth="4"/><circle cx="108" cy="144" r="3" fill="#9ee5b9"/>
    </>;
  }else if(kind==='container'){
    object=<>
      <rect x="18" y="72" width="104" height="81" rx="4" fill="#596566" stroke="#b0b5a7" strokeWidth="4"/>
      <path d="M16 69h108v17H16z" fill="#839089" stroke="#c3cbb9" strokeWidth="3"/>
      {[37,57,79,101].map(x=><path key={x} d={`M${x} 88v61`} stroke="#a9b4a6" strokeWidth="3" opacity=".65"/>)}
      <path d="M46 105h48l-24 24z" fill="#d4b872"/><path d="M52 109h36" stroke="#3c4949" strokeWidth="3"/>
      <rect x="19" y="149" width="102" height="9" fill="#354a50"/>
    </>;
  }else{
    object=<>
      <rect x="27" y="41" width="86" height="116" rx="7" fill="#334b55" stroke="#9db2ae" strokeWidth="5"/>
      <rect x="36" y="51" width="68" height="94" rx="4" fill="#536b6e" stroke="#b6c2ac" strokeWidth="3"/>
      <circle cx="70" cy="97" r="23" fill="#2b4650" stroke="#d1c596" strokeWidth="4"/>
      <circle cx="70" cy="97" r="7" fill="#d7c89e"/>
      <path d="M70 75v15M70 104v15M48 97h15M77 97h15" stroke="#d7c89e" strokeWidth="3"/>
      <rect x="39" y="148" width="19" height="10" fill="#243a43"/><rect x="83" y="148" width="19" height="10" fill="#243a43"/>
    </>;
  }
  return <svg className={`cache-prop prop-${kind}`} viewBox="0 0 140 170" role="presentation" focusable="false" aria-hidden="true">
    <ellipse cx="70" cy="163" rx="53" ry="5" fill="#03151d" opacity=".7"/>
    {object}
  </svg>;
}
