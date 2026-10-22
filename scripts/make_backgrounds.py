"""Generate four detailed, lightweight SVG maps for Project Echo."""

from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(r"D:\Project-Echo\public\scenes")
ROOT.mkdir(parents=True, exist_ok=True)

PALETTES = [
    dict(wall="#193642", lower="#112832", floor="#18343d", rail="#477a7a", glow="#86ddbd", secondary="#e5bf7e", dark="#0a1d29"),
    dict(wall="#173843", lower="#102832", floor="#123744", rail="#3f8795", glow="#79d8d7", secondary="#bcefe2", dark="#071f2a"),
    dict(wall="#383331", lower="#242528", floor="#32302d", rail="#8b6851", glow="#f6bc78", secondary="#b8d1a2", dark="#171d20"),
    dict(wall="#462e38", lower="#251e2b", floor="#3b2930", rail="#9a5960", glow="#ff8f80", secondary="#ffd0a0", dark="#1f1b25"),
]


def defs(p):
    return f'''<defs>
      <linearGradient id="wall" x2="0" y2="1"><stop stop-color="{p['wall']}"/><stop offset="1" stop-color="{p['lower']}"/></linearGradient>
      <linearGradient id="floor" x2="0" y2="1"><stop stop-color="{p['floor']}"/><stop offset="1" stop-color="{p['dark']}"/></linearGradient>
      <linearGradient id="glass" x2="0" y2="1"><stop stop-color="{p['glow']}" stop-opacity=".2"/><stop offset="1" stop-color="{p['dark']}" stop-opacity=".95"/></linearGradient>
      <radialGradient id="pool"><stop stop-color="{p['glow']}" stop-opacity=".35"/><stop offset="1" stop-color="{p['glow']}" stop-opacity="0"/></radialGradient>
      <radialGradient id="shade"><stop offset=".48" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="10"/></filter>
      <pattern id="grain" width="46" height="35" patternUnits="userSpaceOnUse"><path d="M4 8h1M19 28h1M38 5h1M30 20h1" stroke="#fff" stroke-opacity=".09" stroke-width="1"/></pattern>
    </defs>'''


def architecture(p):
    panels = []
    for x in range(0, 1201, 200):
        panels.append(f'<path d="M{x} 40v238" stroke="{p["rail"]}" stroke-opacity=".33" stroke-width="5"/>')
        panels.append(f'<circle cx="{x + 8}" cy="72" r="3" fill="{p["secondary"]}" opacity=".35"/>')
        panels.append(f'<circle cx="{x + 8}" cy="266" r="3" fill="{p["secondary"]}" opacity=".24"/>')
    lamps = []
    for x in (95, 405, 715, 1025):
        lamps.append(f'''<rect x="{x}" y="25" width="90" height="13" rx="3" fill="{p['dark']}" stroke="{p['rail']}" stroke-width="3"/>
          <rect x="{x+10}" y="34" width="70" height="3" fill="{p['glow']}" opacity=".9"/>
          <ellipse cx="{x+45}" cy="93" rx="95" ry="80" fill="url(#pool)" opacity=".28"/>''')
    return f'''<rect width="1200" height="400" fill="url(#wall)"/>
      <rect y="36" width="1200" height="242" fill="url(#grain)"/>
      <path d="M0 20h1200M0 41h1200M0 273h1200" stroke="{p['rail']}" stroke-opacity=".75" stroke-width="7"/>
      <path d="M0 48h1200M0 265h1200" stroke="#000" stroke-opacity=".28" stroke-width="4"/>
      {''.join(panels)}{''.join(lamps)}'''


def floor(p, warning=False):
    perspective = ''.join(f'<path d="M600 278L{x} 400" stroke="{p["rail"]}" stroke-opacity=".33" stroke-width="2"/>' for x in range(-200, 1500, 125))
    dashes = ''.join(f'<path d="M{x} 284h28" stroke="{p["secondary"]}" stroke-opacity=".44" stroke-width="3"/>' for x in range(12, 1200, 100))
    stripes = ''
    if warning:
        stripes = '<g opacity=".5">' + ''.join(f'<path d="M{x} 278l23 17h-13l-23-17z" fill="{p["secondary"]}"/>' for x in range(0, 1200, 50)) + '</g>'
    return f'''<rect y="278" width="1200" height="122" fill="url(#floor)"/>
      <path d="M0 278h1200" stroke="{p['glow']}" stroke-opacity=".58" stroke-width="5"/>
      <path d="M0 290h1200M0 336h1200M0 389h1200" stroke="{p['rail']}" stroke-opacity=".38" stroke-width="2"/>
      {perspective}{dashes}{stripes}
      <path d="M0 282h1200" stroke="#000" stroke-opacity=".22" stroke-width="13"/>'''


def screws(x, y, w, h, color):
    return ''.join(f'<circle cx="{cx}" cy="{cy}" r="3" fill="{color}" opacity=".6"/>' for cx in (x+10, x+w-10) for cy in (y+10, y+h-10))


def label(x, y, content, color="#b9e7d4", size=11):
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial,sans-serif" font-size="{size}" font-weight="700" letter-spacing="2">{content}</text>'


def office(p):
    city = ''.join(f'<rect x="{x}" y="{185-h}" width="{w}" height="{h}" fill="{color}"/>' for x, h, w, color in [
        (42, 46, 35, "#17313d"), (81, 75, 43, "#122a35"), (128, 63, 47, "#173541"), (180, 99, 41, "#102732"), (223, 57, 49, "#17313b")])
    rain = ''.join(f'<path d="M{x} {y}l-7 31" stroke="#91d6ca" opacity=".3" stroke-width="2"/>' for x, y in [(54,72),(86,126),(115,91),(150,146),(186,76),(232,124),(260,84)])
    pins = ''.join(f'<circle cx="{x}" cy="{y}" r="5" fill="{c}"/>' for x,y,c in [(378,111,"#eca572"),(452,130,"#9bd7c3"),(520,94,"#e4c18c"),(573,175,"#e39a83"),(413,204,"#9bd7c3")])
    folders = ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="8" rx="2" fill="{color}"/>' for x,y,w,color in [(350,137,67,"#bdc9b5"),(467,167,66,"#d6c5a6"),(529,212,55,"#c7cfc2"),(390,230,53,"#d8b998")])
    shelf = ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>' for x,y,w,h,color in [
        (972,118,14,49,"#ad806c"),(991,102,13,65,"#627f79"),(1010,124,19,43,"#ad946e"),(1035,108,15,59,"#647b83"),
        (972,195,18,54,"#90896b"),(997,177,14,72,"#a87668"),(1018,191,15,58,"#6d8990"),(1040,180,13,69,"#bd9b72")])
    return f'''<g>
      <rect x="31" y="62" width="256" height="181" rx="9" fill="#102935" stroke="#668c89" stroke-width="9"/>
      <rect x="43" y="74" width="232" height="157" fill="url(#glass)"/>
      <circle cx="212" cy="105" r="26" fill="#e9d8aa" opacity=".68"/>
      {city}<path d="M160 73v159M44 178h231" stroke="#749e9a" stroke-width="8"/>{rain}
      <path d="M30 240h259" stroke="#0b232e" stroke-width="15"/>
      <rect x="332" y="73" width="283" height="188" rx="8" fill="#19323a" stroke="#60867f" stroke-width="10"/>
      <rect x="346" y="86" width="256" height="160" fill="#354d4d"/>
      <path d="M378 111L452 130L520 94L573 175L413 204L452 130" fill="none" stroke="#cf746b" stroke-width="3" opacity=".9"/>
      <rect x="358" y="98" width="61" height="48" fill="#ddd4b9" transform="rotate(-6 388 122)"/>
      <rect x="476" y="155" width="75" height="56" fill="#c5d4cb" transform="rotate(7 513 183)"/>
      <rect x="520" y="79" width="63" height="52" fill="#d2c2a3" transform="rotate(5 550 105)"/>
      {pins}{folders}{label(362,115,"CASE 047", "#536f6b", 9)}
      <path d="M671 239h257l-20 15H650z" fill="#6d6961" stroke="#a9977b" stroke-width="4"/>
      <rect x="696" y="150" width="113" height="80" rx="7" fill="#0c2530" stroke="#719993" stroke-width="7"/>
      <rect x="706" y="160" width="93" height="59" fill="url(#glass)"/>
      <path d="M717 190h24l10-13 12 21 12-10h17" fill="none" stroke="#8ce3c1" stroke-width="3"/>
      <path d="M754 230v11m-26 0h52" stroke="#8da6a2" stroke-width="7"/>
      <rect x="828" y="182" width="72" height="46" rx="3" fill="#d3c4a3" transform="rotate(-5 864 205)"/>
      <path d="M844 196h43m-43 10h36m-36 10h26" stroke="#918b73" stroke-width="2"/>
      <rect x="955" y="73" width="160" height="190" rx="5" fill="#142b34" stroke="#5f7974" stroke-width="9"/>
      <path d="M967 173h137M967 254h137" stroke="#698984" stroke-width="7"/>{shelf}
      <rect x="1071" y="109" width="26" height="56" fill="#627b75"/>
      <rect x="1070" y="188" width="27" height="60" fill="#ad8c6e"/>
      <path d="M1129 78h35v160h-35" fill="none" stroke="#7da69a" stroke-opacity=".6" stroke-width="4"/>
      {label(61,53,"VIRA / OFFICE", "#9acabc", 10)}
    </g>'''


def corridor(p):
    frames = ''.join(f'<path d="M{x} 53L{620+(x-600)*.45} 248M{1200-x} 53L{620+(600-x)*.45} 248" stroke="#5a9ca5" stroke-opacity="{opacity}" stroke-width="{width}"/>'
                     for x, opacity, width in [(80,.46,12),(240,.33,9),(390,.25,7)])
    lamps = ''.join(f'<path d="M{x} 89h100" stroke="#9af0e2" stroke-opacity=".6" stroke-width="5"/>' for x in (66,360,752,1030))
    scanner_panels = []
    for x in (44,232,846,1024):
        scanner_panels.append(f'''<rect x="{x}" y="98" width="123" height="162" rx="6" fill="#102d37" stroke="#528996" stroke-width="7"/>
            <path d="M{x+16} 133h91M{x+16} 155h68M{x+16} 177h91" stroke="#62c4c9" stroke-opacity=".7" stroke-width="4"/>
            <rect x="{x+15}" y="207" width="92" height="29" fill="#275d6a"/>
            <path d="M{x+25} 221h72" stroke="#a1e8d1" stroke-width="3"/>
            {label(x+15,89,'SCAN', '#a4ded6',9)}''')
    return f'''<g>
      <path d="M0 50L526 204L620 252L674 204L1200 50" fill="none" stroke="#2e626e" stroke-width="12" opacity=".6"/>
      {frames}
      <path d="M460 266l90-171h135l84 171" fill="#142e37" stroke="#6cb7b6" stroke-width="8"/>
      <path d="M513 262l56-121h97l54 121" fill="#0d2631" stroke="#3c8994" stroke-width="7"/>
      <rect x="571" y="173" width="95" height="87" rx="3" fill="#153a43" stroke="#75b5b7" stroke-width="6"/>
      <path d="M583 218h70" stroke="#a5ede5" stroke-width="5"/>
      <circle cx="619" cy="195" r="9" fill="#78d8d1"/>
      {''.join(scanner_panels)}{lamps}
      <path d="M0 253l510-4m180 0l510 4" stroke="#85cfcd" stroke-opacity=".5" stroke-width="7"/>
      <path d="M260 42v24m690-24v24" stroke="#79c7c7" stroke-width="9"/>
      <path d="M248 66l-18 14m702 0l-18-14" stroke="#6ca8ac" stroke-width="5"/>
      <circle cx="258" cy="84" r="12" fill="#213f49" stroke="#79c4c7" stroke-width="4"/>
      <circle cx="942" cy="84" r="12" fill="#213f49" stroke="#79c4c7" stroke-width="4"/>
      {label(79,71,"SECURITY CORRIDOR", "#a7e6db", 10)}
      {label(901,71,"SECTOR 02", "#a7e6db", 10)}
    </g>'''


def server_rack(x, y, w, h, p, number):
    rows = []
    for j in range(5):
        ry = y + 29 + j * 32
        rows.append(f'<rect x="{x+12}" y="{ry}" width="{w-24}" height="25" rx="2" fill="#17262a" stroke="#665a4d" stroke-width="2"/>')
        rows.append(f'<path d="M{x+26} {ry+9}h{w*.4:.0f}M{x+26} {ry+16}h{w*.28:.0f}" stroke="#798779" stroke-width="2"/>')
        rows.append(f'<circle cx="{x+w-30}" cy="{ry+12}" r="4" fill="{p["glow"]}"/>')
        rows.append(f'<circle cx="{x+w-45}" cy="{ry+12}" r="3" fill="#78bba4" opacity=".8"/>')
    return f'''<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="#20262a" stroke="#987860" stroke-width="8"/>
      <rect x="{x+8}" y="{y+9}" width="{w-16}" height="16" fill="#5c5046"/>
      {label(x+18,y+22,f'RACK 0{number}', '#e2bd8c', 9)}{''.join(rows)}'''


def server(p):
    cable = ''.join(f'<path d="M{x} 45c0 30 {bend} 30 {bend} 63" fill="none" stroke="{p["rail"]}" stroke-width="{w}" opacity=".85"/>' for x,bend,w in [(95,23,8),(315,-18,7),(735,20,9),(1030,-25,7)])
    return f'''<g>
      <rect x="0" y="69" width="1200" height="197" fill="#2a2c2d" opacity=".3"/>
      <path d="M0 64h1200" stroke="#ac8864" stroke-width="9"/>{cable}
      {server_rack(25,76,196,194,p,1)}{server_rack(246,76,181,194,p,2)}
      {server_rack(766,76,180,194,p,3)}{server_rack(972,76,196,194,p,4)}
      <rect x="484" y="76" width="229" height="191" rx="12" fill="#252c2d" stroke="#9b7658" stroke-width="10"/>
      <rect x="503" y="93" width="191" height="139" rx="6" fill="#10292f" stroke="#5c8178" stroke-width="5"/>
      <circle cx="599" cy="161" r="54" fill="url(#pool)"/>
      <circle cx="599" cy="161" r="42" fill="none" stroke="#eab478" stroke-width="7" opacity=".8"/>
      <circle cx="599" cy="161" r="27" fill="none" stroke="#a7dbb4" stroke-width="5" opacity=".8"/>
      <path d="M537 161h124M599 104v114" stroke="#e7b67c" stroke-opacity=".55" stroke-width="3"/>
      {label(534,253,"DATA VAULT 03", '#efcc9d', 10)}
      <path d="M440 260h310" stroke="#c29a71" stroke-opacity=".7" stroke-width="6"/>
      <rect x="443" y="66" width="308" height="9" rx="3" fill="#916d51"/>
      <circle cx="461" cy="70" r="4" fill="#ffd099"/>
      <circle cx="732" cy="70" r="4" fill="#ffd099"/>
    </g>'''


def emergency(p):
    screen_lines = ''.join(f'<path d="M{728+x} {126+y}h{w}" stroke="{c}" stroke-width="4" opacity=".85"/>' for x,y,w,c in [(0,0,130,"#ffb18d"),(0,23,100,"#d97d78"),(0,46,120,"#f3a887"),(0,69,77,"#d97d78")])
    ribs = ''.join(f'<path d="M{x} 55l{slant} 215" stroke="#8e525b" stroke-width="14" opacity=".65"/>' for x,slant in [(65,50),(330,30),(900,-30),(1160,-55)])
    return f'''<g>
      {ribs}
      <rect x="26" y="74" width="266" height="190" rx="7" fill="#241e2a" stroke="#ad6364" stroke-width="9"/>
      <rect x="40" y="89" width="238" height="158" fill="#442d37"/>
      <path d="M63 207l52-48 43 14 60-60 40 31" fill="none" stroke="#f58e7c" stroke-width="7"/>
      <path d="M61 120h86M61 138h60" stroke="#f3c19c" stroke-width="4"/>
      <circle cx="242" cy="217" r="18" fill="#ee786e"/>
      {label(66,108,"LOCKDOWN", '#ffd1aa', 11)}
      <path d="M381 67h210v200H381z" fill="#26202c" stroke="#aa6568" stroke-width="10"/>
      <path d="M399 82h174v183H399z" fill="#49343c"/>
      <path d="M486 88v171M403 175h167" stroke="#96636a" stroke-width="8"/>
      <path d="M424 103l122 135m0-135L424 238" stroke="#e99781" stroke-opacity=".85" stroke-width="8"/>
      <circle cx="486" cy="170" r="21" fill="#ea8274" stroke="#ffd0a0" stroke-width="7"/>
      <rect x="698" y="80" width="190" height="182" rx="8" fill="#251f2a" stroke="#a85f65" stroke-width="9"/>
      <rect x="713" y="98" width="160" height="128" fill="#392b37"/>{screen_lines}
      <path d="M728 205h128" stroke="#f3a588" stroke-width="7"/>
      {label(725,251,"OVERRIDE 04", '#ffd0a0', 10)}
      <rect x="972" y="82" width="170" height="180" rx="7" fill="#261d29" stroke="#b76667" stroke-width="9"/>
      <path d="M991 119h130M991 150h130M991 181h130M991 212h130" stroke="#c98276" stroke-width="6"/>
      <circle cx="1076" cy="232" r="13" fill="#ff8478"/>
      <g fill="#ff897a"><circle cx="87" cy="45" r="10"/><circle cx="522" cy="45" r="10"/><circle cx="1100" cy="45" r="10"/></g>
      <g fill="#ff897a" opacity=".6" filter="url(#soft)"><circle cx="87" cy="45" r="23"/><circle cx="522" cy="45" r="23"/><circle cx="1100" cy="45" r="23"/></g>
      {label(779,62,"ALERT / EVIDENCE WIPE", '#ffc2a1', 10)}
    </g>'''


SCENES = [office, corridor, server, emergency]

for index, make in enumerate(SCENES):
    p = PALETTES[index]
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
      {defs(p)}{architecture(p)}{floor(p, warning=index==3)}{make(p)}
      <rect width="1200" height="400" fill="url(#shade)" pointer-events="none"/>
    </svg>'''
    ElementTree.fromstring(svg)
    (ROOT / f"room-{index}.svg").write_text(svg, encoding="utf-8")
    print(f"room-{index}.svg: {len(svg)} characters")
