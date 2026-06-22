#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE RANCH - EXPANSION PRE-CONCEPT BRIEFS (Al Ain + Abu Dhabi)
Builds a landscape, board-grade PDF mirroring the Sharjah concept deck.
Renderer: WeasyPrint. Fonts: Fraunces (display) + Archivo (text), embedded.
No em dashes anywhere by design.
"""
import os, html
HERE = os.path.dirname(os.path.abspath(__file__))

# ----------------------------------------------------------------- helpers
def esc(s): return html.escape(str(s), quote=False)

SLIDES = []
def add(s): SLIDES.append(s)

def foot(page, tag="AFHAD PROPERTIES"):
    return (f'<div class="foot"><span>{tag}</span>'
            f'<span class="mid">THE RANCH &nbsp;|&nbsp; EXPANSION BRIEFS</span>'
            f'<span>{page}</span></div>')

def header(eyebrow, h1, h2=None, sub=None):
    s = f'<div class="eyebrow">{eyebrow}</div><h1 class="h-disp">{h1}'
    if h2: s += f'<span class="it">{h2}</span>'
    s += '</h1>'
    if sub: s += f'<p class="subhead">{sub}</p>'
    return s

# ----------------------------------------------------------------- parti SVG
def parti(volumes, north_lbl="PARKING &amp; LANDSCAPE RIBBON · NORTH"):
    """volumes: list of (label, sublabel, color, x, w, y, h) on a 1200x250 field."""
    body = []
    body.append('<rect x="0" y="6" width="1200" height="30" fill="#E7DDCC"/>')
    body.append(f'<text x="600" y="26" class="pt-lab">{north_lbl}</text>')
    body.append('<rect x="0" y="206" width="1200" height="30" fill="#E7DDCC"/>')
    body.append('<text x="600" y="226" class="pt-lab">CONSOLIDATED PARKING · PRIMARY ARRIVAL · SOUTH</text>')
    for (lab, sub2, col, x, w, y, h) in volumes:
        body.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="22" fill="{col}" stroke="#2C2A27" stroke-width="1.2"/>')
        cx = x + w/2; cy = y + h/2
        body.append(f'<text x="{cx}" y="{cy-3}" class="vol-t">{esc(lab)}</text>')
        body.append(f'<text x="{cx}" y="{cy+13}" class="vol-s">{esc(sub2)}</text>')
    return (f'<svg viewBox="0 0 1200 250" class="parti" preserveAspectRatio="xMidYMid meet">'
           '<style>'
           '.pt-lab{font-family:Archivo;font-weight:600;font-size:9px;letter-spacing:2px;'
           'fill:#8A7B63;text-anchor:middle;text-transform:uppercase}'
           '.vol-t{font-family:Fraunces;font-weight:700;font-size:13px;fill:#fff;text-anchor:middle}'
           '.vol-s{font-family:Archivo;font-weight:500;font-size:9px;fill:#F3EBE1;text-anchor:middle;font-style:italic}'
           '</style>' + ''.join(body) + '</svg>')

# ================================================================ CONTENT
TEAL="#0F6E70"; TEALD="#0A4E50"; RUST="#C2703D"; CLAY="#B5654A"; GOLD="#D8A24A"
SAGE="#7E8F6A"; STONE="#9C8E7A"; TEAL2="#3E9CA0"

# ---------- 1. COVER ----------
add(f'''<div class="slide">
  <div style="margin-top:0.15in">{header("AFHAD PROPERTIES &nbsp; | &nbsp; CONCEPT DIRECTION &nbsp; | &nbsp; FOR BOARD REVIEW",
     "The Ranch", "Al Ain &amp; Abu Dhabi")}</div>
  <p class="subhead" style="margin-top:22px">Two expansion pre-concept briefs. The Sharjah blueprint, taken city by city.
  Tenure and macro held constant; location, catchment and whitespace re-run from the data; the concept rebuilt to fit
  what each city cannot buy today.</p>
  <div class="databand" style="bottom:0.98in">
    <div><div class="lbl">Origin asset</div><div class="bv">The Ranch at Al Rahmaniya, Sharjah</div></div>
    <div><div class="lbl">Tenure (constant)</div><div class="bv">Musataha / usufruct, income led</div></div>
    <div><div class="lbl">Levers re-run</div><div class="bv">Location · Catchment · Whitespace</div></div>
    <div><div class="lbl">This document</div><div class="bv">Al Ain brief · Abu Dhabi brief</div></div>
  </div>
  {foot("01")}
</div>''')

# ---------- 2. APPROACH (constants vs levers) ----------
chain = [
 ("01","Tenure","Musataha. No terminal value. Income must clear the hurdle inside the lease term.","const","CONSTANT"),
 ("02","Macro","Community retail under-built across the UAE. Emirati villa catchments insulated from expat flows.","const","CONSTANT"),
 ("03","Location","Re-run per city. The plot logic, frontage and arrival change with the site.","lever","RE-RUN"),
 ("04","Catchment","Re-run per city. Who lives within the drive-time ring, and what they cannot buy.","lever","RE-RUN"),
 ("05","Whitespace","Re-run per city. The verified category gaps that become the tenant spine.","lever","RE-RUN"),
 ("06","Concept","The output, not the input. Rebuilt tenant mix on the same industrial typology.","lever","OUTPUT"),
]
steps=""
for n,st,bd,cls,tag in chain:
    steps+=f'<div class="step"><div class="n">{n}</div><div class="rule"></div><div class="st">{st}</div><div class="bd">{bd}</div><span class="tag {cls}">{tag}</span></div>'
add(f'''<div class="slide">
  {header("OUR APPROACH","Concept is the output of data,","not an input.",
   "The same six-step value chain that produced the Sharjah asset. Tenure and macro carry over unchanged. The middle three levers are re-run from each city's own data, and the concept follows.")}
  <div class="chain">{steps}</div>
  {foot("02")}
</div>''')

# ================================================================ PART A: AL AIN
add(f'''<div class="slide dark">
  <div class="divider">
    <div class="sec-n">Brief One</div>
    {header("THE GARDEN CITY · EMIRATI HEARTLAND","The Ranch","at Al Ain")}
    <p class="subhead" style="max-width:8.4in">A fine-dining market hall and a world-class wellness hangar for the UAE's most concentrated
    Emirati villa city. The mandate is set; the data confirms why it holds.</p>
  </div>
  {foot("03")}
</div>''')

# A2 location & catchment
add(f'''<div class="slide">
  {header("3 · LOCATION &amp; CATCHMENT","An affluent Emirati villa city,","under-retailed by design.",
   "Al Ain is the Emirati heartland of Abu Dhabi emirate: a family, villa-dominant, owner-occupier market that has been deliberately held below global retail density.")}
  <div class="stats s4">
    <div class="stat"><div class="sl">Al Ain region population</div><div class="sv">987K</div><div class="sc">SCAD 2024, +4.4% year on year</div></div>
    <div class="stat"><div class="sl">UAE National share</div><div class="sv">~31%</div><div class="sc">highest of any major UAE city</div></div>
    <div class="stat"><div class="sl">Average villa asking</div><div class="sv">4.9M</div><div class="sc">AED, Bayut 2025 listings</div></div>
    <div class="stat"><div class="sl">Retail per resident, 2030</div><div class="sv">1.1</div><div class="sc">sqm, Plan Al Ain 2030 target</div></div>
  </div>
  <div class="points" style="margin-top:34px">
    <div class="pt"><div class="ph">Owner-occupier Emirati wealth.</div><div class="pb">Villa households across Al Towayya, Asharej, Falaj Hazzaa and Al Jimi. End-user demand, low speculative volatility.</div></div>
    <div class="pt"><div class="ph">A committed villa pipeline.</div><div class="pb">10,316 villas across five developments inside the AED 106bn Abu Dhabi housing programme, Aldar's Al Oyoun Village among them.</div></div>
    <div class="pt"><div class="ph">A fast-growing tourism spine.</div><div class="pb">473,100 hotel guests in FY2025, up 9%. DCT positions Al Ain on culture, wellness and adventure: Jebel Hafeet, the UNESCO oases, Green Mubazzarah.</div></div>
    <div class="pt"><div class="ph">Enclosed malls only.</div><div class="pb">Roughly seven hypermarket-anchored malls, repetitive anchors, no open-air lifestyle destination in the city.</div></div>
  </div>
  <div class="src">Sources: SCAD 2024; Bayut 2025 listings; Plan Al Ain 2030 / Aldar 2016; Abu Dhabi Media Office &amp; DCT 2025; Arabian Post 2026. Villa pricing is asking, not registered transactions.</div>
  {foot("04")}
</div>''')

# A3 mandate verified - proposition numbers
add(f'''<div class="slide panel">
  {header("4 · THE MANDATE, VERIFIED","Fine dining and a world-class gym,","confirmed by the gap.",
   "The mandate set fine dining and a world-class fitness anchor. Targeted verification holds it up: the fine-dining whitespace is acute, the premium-gym lane is real but contested, which sharpens the brief toward integrated wellness.")}
  <div class="stats s3">
    <div class="stat"><div class="sl">Fine-dining venues in Al Ain</div><div class="sv">0</div><div class="sc">vs 56 in Abu Dhabi city, 100+ in Dubai (MICHELIN 2026)</div></div>
    <div class="stat"><div class="sl">Premium large-format gyms</div><div class="sv">1</div><div class="sc">one credible incumbent at scale; rest value or hotel</div></div>
    <div class="stat"><div class="sl">Integrated wellness + longevity</div><div class="sv">None</div><div class="sc">no operator combines training, recovery, longevity</div></div>
  </div>
  <div class="points" style="margin-top:30px">
    <div class="pt"><div class="ph">Fine dining: an acute, leaking gap.</div><div class="pb">The entire upper tier is four to five ageing hotel restaurants. Affluent residents drive to Abu Dhabi and Dubai for chef-driven dining. Note the operating constraint: licensed dining in Al Ain sits in hotels, so the model favours a licensed-hotel partnership or a destination format.</div></div>
    <div class="pt"><div class="ph">Gym: win on integration, not on a box.</div><div class="pb">A single large-format incumbent already holds the pure-fitness lane. The open ground is the integrated facility: premium training plus structured recovery, longevity and boutique studios, where no incumbent exists.</div></div>
  </div>
  <div class="src">Sources: MICHELIN Guide 2026; Gold's Gym UAE 2026; GymNation 2026; operator triangulation (Rotana, Danat, Radisson, Mercure), 2025 to 2026. Venue counts are triangulated estimates; no Al Ain F&amp;B census is published.</div>
  {foot("05")}
</div>''')

# A4 whitespace map table
rows_alain = [
 ("Destination fine dining","ABSENT","HIGH","v-prim","PRIMARY","Zero standalone venues; demand leaks to Abu Dhabi and Dubai"),
 ("Integrated wellness + longevity","ABSENT","HIGH","v-prim","PRIMARY","Recovery and longevity exist only as fragmented clinics"),
 ("World-class gym (large format)","THIN","HIGH","v-prim","PRIMARY","One incumbent; differentiate via integration"),
 ("Open-air lifestyle retail","ABSENT","HIGH","v-prim","PRIMARY","No operating open-air village; one hybrid in build"),
 ("Specialty &amp; artisan grocer","THIN","MED","v-sec","SECONDARY","Anchors are mass hypermarkets, Carrefour and LuLu"),
 ("Children's enrichment","THIN","MED","v-sec","SECONDARY","Young, family-weighted, high-National catchment"),
 ("Hypermarket, fashion, perfumes","SATURATED","-","v-avoid","AVOID","Replicated across seven enclosed malls"),
]
trows=""
for cat,sup,dem,vc,vt,note in rows_alain:
    trows+=f'<tr><td class="cat">{cat}</td><td>{sup}</td><td>{dem}</td><td><span class="verdict {vc}">{vt}</span></td><td>{note}</td></tr>'
add(f'''<div class="slide">
  {header("5 · WHITESPACE MAP","Where supply ends","and demand begins.",
   "Each category scored on Al Ain supply against assessed catchment demand. The primary gaps form the spine of the tenant programme.")}
  <table class="grid">
    <thead><tr><th style="width:24%">Category</th><th style="width:11%">Supply</th><th style="width:9%">Demand</th><th style="width:13%">Verdict</th><th>Note</th></tr></thead>
    <tbody>{trows}</tbody>
  </table>
  {foot("06")}
</div>''')

# A5 five whitespaces cards
cards_alain = [
 ("01","Destination fine dining","Zero","standalone venues today","Chef-driven, licensed via hotel partnership. The category the catchment leaves the city to buy."),
 ("02","Gym &amp; wellness hangar","1,500+","target members","World-class training fused with recovery and longevity. Integration is the moat, not square metres."),
 ("03","Longevity &amp; recovery","None","integrated today","Cryotherapy, contrast, IV and diagnostics under one roof. Fragmented clinics only, no destination."),
 ("04","Specialty grocer","Daily","repeat trips","Fresh-focused artisan format. The base-load revenue engine away from mass hypermarket anchors."),
 ("05","Open-air lifestyle","First","mover position","A true open-air village, experience-led, differentiated from the one hybrid scheme now in build."),
]
cc=""
for n,t,s,cap,b in cards_alain:
    cc+=f'<div class="card"><div class="cn">{n}</div><div class="ct">{t}</div><div class="cs">{s}</div><div class="ccap">{cap}</div><div class="cb">{b}</div></div>'
add(f'''<div class="slide panel">
  {header("5 · THE WHITESPACES","Five categories","Al Ain cannot buy today.",
   "The primary and supporting whitespaces, drawn from the category map. These are the spine of the proposed tenant mix.")}
  <div class="cards c5">{cc}</div>
  <div class="src">Children's enrichment and a multi-specialty clinic sit alongside as complementary secondary whitespaces.</div>
  {foot("07")}
</div>''')

# A6 concept pillars
pill_alain = [
 ("01 / PILLAR","Fine-dining market hall","WEEKLY DIFFERENTIATOR",
  ["Ten to fifteen curated chef-driven operators anchor the hall as a regional weekend destination.",
   "Operable glazing to shaded terraces; year-round dining against the oasis and mountain backdrop.",
   "Licensed dining structured through hotel partnership; the rest reads as a premium destination."]),
 ("02 / PILLAR","Gym, wellness &amp; longevity","FOOTFALL GENERATOR",
  ["A world-class steel-portal hangar: 1,500-plus members at scale, daylit training floors.",
   "Structured recovery, longevity diagnostics and boutique studios under one roof.",
   "The integration no incumbent offers, generating consistent cross-visits to F&amp;B."]),
 ("03 / PILLAR","Daily lifestyle anchor","BASE-LOAD REVENUE",
  ["Specialty artisan grocer, clinic, pharmacy and service kiosks for daily repeat trips.",
   "An open-air village format the city does not yet have, tuned to villa dwellers.",
   "Cross-subsidises the fine-dining anchor through the ramp-up period."]),
]
def pillars(items):
    out='<div class="points" style="grid-template-columns:1fr 1fr 1fr;margin-top:34px;gap:0 30px">'
    for ey,t,k,bl in items:
        lis="".join(f'<li>{x}</li>' for x in bl)
        out+=(f'<div><div class="lbl" style="color:#8A7B63">{ey}</div>'
              f'<div style="font-family:Fraunces;font-weight:700;font-size:21px;color:{TEALD};margin:6px 0 4px;line-height:1.05">{t}</div>'
              f'<div class="lbl" style="margin-bottom:10px">{k}</div>'
              f'<ul style="margin:0;padding-left:16px;font-size:12px;color:#6B655D;line-height:1.5">{lis}</ul></div>')
    return out+'</div>'
add(f'''<div class="slide">
  {header("6 · THE CONCEPT","The Ranch at Al Ain,","built on three pillars.",
   "Not a mall, not a hypermarket extension. A fine-dining market hall paired with a world-class wellness hangar, on the same industrial-village typology.")}
  {pillars(pill_alain)}
  {foot("08")}
</div>''')

# A7 parti + materials
vol_alain = [
 ("GYM & WELLNESS","steel portal hangar", TEAL, 80, 250, 70, 115),
 ("GALLERY","seam", GOLD, 350, 90, 88, 80),
 ("FINE-DINING HALL","destination anchor", CLAY, 460, 290, 60, 135),
 ("GALLERY","seam", GOLD, 770, 90, 88, 80),
 ("SPECIALTY GROCER","fresh market", RUST, 880, 250, 70, 115),
]
add(f'''<div class="slide panel">
  {header("6 · THE PARTI &amp; BUILD LOGIC","One shell,","the mix is the lever.",
   "Gym hangar tilted west, fine-dining hall on axis, specialty grocer tilted east, with gallery seams between. The envelope is held constant and cheap; the tenant mix does the work.")}
  <div style="margin-top:14px;background:var(--white);border:1px solid var(--line);padding:12px 16px">{parti(vol_alain)}</div>
  <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:30px;margin-top:14px">
    <div>
      <div class="lbl">Shell · constant, income-optimised</div>
      <div class="ratio"><div class="steel" style="width:84%">STEEL-LED SHELL</div><div class="conc" style="width:16%">FIT-OUT</div></div>
      <div class="cb" style="margin-top:8px;color:#6B655D">Identical to Sharjah: steel portal frame, lightweight envelope, slab on grade, build matched to the usufruct. Income clears the hurdle, so no masonry premium is chased.</div>
    </div>
    <div>
      <div class="lbl">The only tilt · minor, tenant-led</div>
      <div class="cb" style="color:#6B655D">Fit-out concentrates where rent pays for it: the fine-dining hall. Wellness directs spend to MEP, not finishes. The lever is tenant selection, not structure.</div>
    </div>
  </div>
  {foot("09")}
</div>''')

# ================================================================ PART B: ABU DHABI
add(f'''<div class="slide dark">
  <div class="divider">
    <div class="sec-n">Brief Two</div>
    {header("THE CAPITAL · OPEN-BOOK WHITESPACE","The Ranch","at Abu Dhabi")}
    <p class="subhead" style="max-width:8.8in">Not a replica of the Sharjah formula. A data-led whitespace search points the capital somewhere it cannot buy today:
    a premium social, wellness and food destination for its affluent residents, its wealth-migration cohort and its cultural footfall.</p>
  </div>
  {foot("10")}
</div>''')

# B2 location & catchment
add(f'''<div class="slide">
  {header("3 · LOCATION &amp; CATCHMENT","A capital catchment,","not a commuter suburb.",
   "Abu Dhabi is not Sharjah. The defining catchment is the wealth and culture spine of Saadiyat, Al Maryah and Al Reem: affluent residents, the ADGM professional base, and a record stream of relocating capital and visitors.")}
  <div class="stats s4">
    <div class="stat"><div class="sl">Emirate population</div><div class="sv">4.1M</div><div class="sc">SCAD 2024, +7.5%, +51% over the decade</div></div>
    <div class="stat"><div class="sl">ADGM workforce</div><div class="sv">+51%</div><div class="sc">to 44,339; institutions +135% since 2021</div></div>
    <div class="stat"><div class="sl">Millionaire migration</div><div class="sv">No.1</div><div class="sc">UAE leads the world, ~9,800 in 2025</div></div>
    <div class="stat"><div class="sl">Visitors, 2025</div><div class="sv">26.6M</div><div class="sc">record; DCT targets 39.3m by 2030</div></div>
  </div>
  <div class="points" style="margin-top:34px">
    <div class="pt"><div class="ph">Wealth is arriving, and concentrating.</div><div class="pb">The UAE ranks first in the world for millionaire migration, and Abu Dhabi's ADGM has grown its workforce 51% to 44,339 with assets under management up sharply. This cohort has no home base in the capital.</div></div>
    <div class="pt"><div class="ph">A cultural district now fully live.</div><div class="pb">Louvre Abu Dhabi drew 1.4m visitors in 2025, the Zayed National and Natural History museums opened in late 2025, and Guggenheim follows in 2026. Cultural footfall reached 8.6m across the emirate.</div></div>
    <div class="pt"><div class="ph">A tight, space-starved market.</div><div class="pb">Prime retail runs near 95% occupancy and Grade A office vacancy sits below 1.5%, with rents climbing. Quality lifestyle space is scarce, not surplus.</div></div>
    <div class="pt"><div class="ph">The location lever moves.</div><div class="pb">Where Sharjah was a single villa ring, the capital concept addresses a destination catchment on the islands. Site selection narrows to the Saadiyat, Al Maryah and Al Reem axis.</div></div>
  </div>
  <div class="src">Sources: SCAD 2024; ADGM decade announcement 2026; Henley &amp; Partners 2025; DCT Abu Dhabi 2025 Annual Report; Louvre Abu Dhabi 2025; CBRE / JLL Q3 to Q4 2025. Where noted, figures are UAE-level and flagged accordingly.</div>
  {foot("11")}
</div>''')

# B3 why not Sharjah formula
add(f'''<div class="slide panel">
  {header("4 · POSITIONING","Why the capital needs","a different anchor.",
   "Copying the Sharjah mix of supermarket, gym and generic F&amp;B would add undifferentiated stock to a space-starved market. The capital's own gaps point to social, wellness and food, the categories its affluent base leaves the city to buy.")}
  <div class="stats s3">
    <div class="stat"><div class="sl">Members' clubs in the capital</div><div class="sv">0</div><div class="sc">no Soho House in the UAE; ecosystem sits in Dubai</div></div>
    <div class="stat"><div class="sl">Curated food halls operating</div><div class="sv">0</div><div class="sc">Time Out Abu Dhabi still unbuilt; Dubai runs three</div></div>
    <div class="stat"><div class="sl">Longevity clinics licensed</div><div class="sv">~2</div><div class="sc">world-first DoH licence category, Oct 2024</div></div>
  </div>
  <div class="points" style="margin-top:30px">
    <div class="pt"><div class="ph">The social and food gaps are stark.</div><div class="pb">There is no members' or creative club in the capital and no operating curated food hall, while Dubai runs a deep stack of both. For a city now leading global wealth migration, that is the clearest whitespace on the board.</div></div>
    <div class="pt"><div class="ph">The state has placed its wellness bet.</div><div class="pb">The Department of Health created the world's first Healthy Longevity Medicine Centre licence, and M42 runs the largest omics centre outside the US on an 800,000-genome programme. Preventative wellness is policy, not trend.</div></div>
  </div>
  <div class="src">Sources: FACT Magazine 2026; Time Out 2026; The National 2021 to 2026; DoH 2024 to 2025; M42 2025. Soho House absence is by absence of evidence across UAE listings.</div>
  {foot("12")}
</div>''')

# B4 whitespace map
rows_ad = [
 ("Members' &amp; creative social club","ABSENT","HIGH","v-prim","PRIMARY","No club in the capital; ADGM cohort up 51%, wealth inflow No.1"),
 ("Curated food hall &amp; artisan market","ABSENT","HIGH","v-prim","PRIMARY","Time Out Abu Dhabi unbuilt; Dubai runs three live"),
 ("Longevity &amp; preventative wellness","THIN","HIGH","v-prim","PRIMARY","World-first licence; only ~2 facilities; cluster is in Dubai"),
 ("Arts-led experiential F&amp;B","THIN","HIGH","v-prim","PRIMARY","Saadiyat anchors now live; on-site retail still thin"),
 ("Boutique fitness &amp; recovery","THIN","HIGH","v-sec","SECONDARY","No category leader; activity participation at 60%"),
 ("Specialist family health, STEAM","THIN","MED","v-sec","SECONDARY","Real gaps; better suited to a community-corridor site"),
 ("Core IVF, big-box gym, mega-attractions","SATURATED","-","v-avoid","AVOID","Sovereign and Miral incumbents already at scale"),
]
trows2=""
for cat,sup,dem,vc,vt,note in rows_ad:
    trows2+=f'<tr><td class="cat">{cat}</td><td>{sup}</td><td>{dem}</td><td><span class="verdict {vc}">{vt}</span></td><td>{note}</td></tr>'
add(f'''<div class="slide">
  {header("5 · WHITESPACE MAP","What the capital","cannot buy locally.",
   "An open-book scan across social, food, wellness, sport and culture. The verdicts redraw the anchor away from the Sharjah template.")}
  <table class="grid">
    <thead><tr><th style="width:30%">Category</th><th style="width:10%">Supply</th><th style="width:9%">Demand</th><th style="width:13%">Verdict</th><th>Note</th></tr></thead>
    <tbody>{trows2}</tbody>
  </table>
  {foot("13")}
</div>''')

# B5 cards
cards_ad = [
 ("01","Members' &amp; creative club","0","in the capital today","A members' and family-office house with workspace, dining and programming for the ADGM and wealth-migration cohort."),
 ("02","Curated food hall","0","operating, vs 3 in Dubai","A destination market hall of curated chef-driven operators. The capital's clearest food whitespace."),
 ("03","Longevity &amp; wellness","~2","clinics in the capital","Preventative, diagnostic, longevity-led care. A world-first licence with the cluster still sitting in Dubai."),
 ("04","Arts-led F&amp;B","8.6M","cultural visits, 2025","Experiential, culturally-themed dining and retail riding the now-live Saadiyat museum district."),
 ("05","Boutique fitness &amp; recovery","No","category leader","Reformer, strength and structured recovery studios riding a steep activity curve. A land-grab phase."),
]
cc2=""
for n,t,s,cap,b in cards_ad:
    cc2+=f'<div class="card"><div class="cn">{n}</div><div class="ct">{t}</div><div class="cs">{s}</div><div class="ccap">{cap}</div><div class="cb">{b}</div></div>'
add(f'''<div class="slide panel">
  {header("5 · THE WHITESPACES","Five categories","that fit the capital, not the template.",
   "The redrawn spine: social, food and wellness lead, riding the capital's wealth inflow and cultural halo, with fitness and convenience as the base load.")}
  <div class="cards c5">{cc2}</div>
  <div class="src">Specialist family health and STEAM discovery are strong capital-wide gaps better matched to a community-corridor site such as Al Shamkha, and are carried as the alternative-site option. Sources: ADGM 2026; Henley 2025; Time Out 2026; DoH 2025; DCT 2025.</div>
  {foot("14")}
</div>''')

# B6 concept pillars
pill_ad = [
 ("01 / PILLAR","Social &amp; food destination","WEEKLY DIFFERENTIATOR",
  ["A members' and creative club paired with a curated, chef-driven food hall.",
   "Programming, dining and family-office lounge for the ADGM and wealth cohort.",
   "Two categories the capital cannot buy today, against a deep Dubai stack."]),
 ("02 / PILLAR","Wellness &amp; longevity","FOOTFALL GENERATOR",
  ["A preventative and longevity pavilion aligned to the world-first DoH licence.",
   "Boutique fitness, reformer and structured recovery riding the activity curve.",
   "The wellness draw the affluent base now leaves the city to find."]),
 ("03 / PILLAR","Curated daily base","BASE-LOAD REVENUE",
  ["Specialty grocer, arts-led cafés and service kiosks for daily repeat trips.",
   "Indoor racquet and movement courts as cross-visit amenity.",
   "Cross-subsidises the club and wellness anchors through ramp-up."]),
]
add(f'''<div class="slide">
  {header("6 · THE CONCEPT","The Ranch at Abu Dhabi,","a social and wellness house.",
   "The same industrial-village typology, re-anchored for the capital. A members' club and food hall generate the destination draw; longevity and fitness generate the footfall; curated convenience carries the base load.")}
  {pillars(pill_ad)}
  {foot("15")}
</div>''')

# B7 parti + materials
vol_ad = [
 ("GYM & WELLNESS","wellness pavilion", TEAL, 80, 250, 70, 115),
 ("GALLERY","seam", GOLD, 350, 90, 88, 80),
 ("CURATED FOOD HALL","destination anchor", CLAY, 460, 290, 60, 135),
 ("GALLERY","seam", GOLD, 770, 90, 88, 80),
 ("MEMBERS' CLUB","members lounge", SAGE, 880, 250, 70, 115),
]
add(f'''<div class="slide panel">
  {header("6 · THE PARTI &amp; BUILD LOGIC","One shell,","the mix is the lever.",
   "Wellness and fitness tilted west, the curated food hall on axis, the members' club tilted east, with gallery seams between. Same constant envelope as Al Ain; the tenant mix does the work.")}
  <div style="margin-top:14px;background:var(--white);border:1px solid var(--line);padding:12px 16px">{parti(vol_ad, "ARRIVAL &amp; LANDSCAPE FORECOURT · NORTH")}</div>
  <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:30px;margin-top:14px">
    <div>
      <div class="lbl">Shell · constant, income-optimised</div>
      <div class="ratio"><div class="steel" style="width:84%">STEEL-LED SHELL</div><div class="conc" style="width:16%">FIT-OUT</div></div>
      <div class="cb" style="margin-top:8px;color:#6B655D">The same steel portal shell and lightweight envelope as Al Ain. The usufruct is cleared by income, so the envelope stays cheap and fast in both cities.</div>
    </div>
    <div>
      <div class="lbl">The only tilt · minor, tenant-led</div>
      <div class="cb" style="color:#6B655D">Fit-out concentrates on the members' club and food hall, where rent and membership pay for it. The wellness pavilion spends on MEP. The lever is tenant selection, not structure.</div>
    </div>
  </div>
  {foot("16")}
</div>''')

# ================================================================ CLOSE
add(f'''<div class="slide">
  {header("ONE BLUEPRINT, THREE CITIES","What holds,","and what is re-run.",
   "The constants travel. The levers are re-run from each city's data, and the concept follows. Same typology, three different answers.")}
  <table class="grid">
    <thead><tr><th style="width:22%">Lever</th><th>Sharjah · Al Rahmaniya</th><th>Al Ain</th><th>Abu Dhabi</th></tr></thead>
    <tbody>
    <tr><td class="cat">Tenure</td><td>Musataha, income led</td><td>Musataha, income led</td><td>Musataha, income led</td></tr>
    <tr><td class="cat">Macro</td><td>Community retail under-built</td><td>Community retail under-built</td><td>Community retail under-built</td></tr>
    <tr><td class="cat">Catchment</td><td>~48K Emirati villa, Y5</td><td>~987K region, ~31% National</td><td>Capital wealth &amp; culture spine</td></tr>
    <tr><td class="cat">Whitespace</td><td>F&amp;B, gym, grocer, wellness</td><td>Fine dining, gym + longevity</td><td>Social club, food hall, longevity</td></tr>
    <tr><td class="cat">Concept anchor</td><td>Market hall + wellness hangar</td><td>Fine-dining hall + wellness hangar</td><td>Social &amp; wellness house</td></tr>
    <tr><td class="cat">Shell (constant)</td><td>Steel-led, income-optimised</td><td>Steel-led, income-optimised</td><td>Steel-led, income-optimised</td></tr>
    <tr><td class="cat">Fit-out tilt (minor)</td><td>Standard</td><td>To the fine-dining hall</td><td>To the club and food hall</td></tr>
    </tbody>
  </table>
  {foot("17")}
</div>''')

add(f'''<div class="slide dark">
  <div class="divider">
    <div class="sec-n">For Board Review</div>
    {header("AFHAD PROPERTIES · JUNE 2026","The Ranch","Al Ain &amp; Abu Dhabi")}
    <div class="points" style="grid-template-columns:1fr 1fr;margin-top:26px;max-width:9.2in">
      <div class="pt"><div class="ph" style="color:#7FC9CB">Al Ain</div><div class="pb" style="color:#CFE3E3">Fine-dining market hall and a world-class wellness hangar, integrating longevity and recovery, for the Emirati heartland. Mandate verified by an acute dining gap.</div></div>
      <div class="pt"><div class="ph" style="color:#7FC9CB">Abu Dhabi</div><div class="pb" style="color:#CFE3E3">A social and wellness house, members' club, curated food hall and longevity pavilion, on the capital's wealth and culture spine. The gaps the city leaves to Dubai today.</div></div>
    </div>
    <p class="subhead" style="margin-top:24px;max-width:9in;color:#9FCFD0">Both on the same industrial-village typology and Musataha logic. Next step: site selection and plot-specific massing per city, then catchment isochrones on the confirmed parcels.</p>
  </div>
  {foot("18","AFHAD PROPERTIES")}
</div>''')

# ---------- SOURCES / CITATIONS (appendix) ----------
refgroups = [
 ("Official statistics &amp; government", [
   ("Statistics Centre Abu Dhabi (SCAD).", "2024. Population estimates, Abu Dhabi Emirate and Al Ain Region. scad.gov.ae"),
   ("Department of Health, Abu Dhabi (DoH).", "2024 to 2025. Healthy Longevity Medicine Centre licensing; ABA guidelines for ASD; births and IVF data. doh.gov.ae"),
   ("Department of Culture and Tourism, Abu Dhabi (DCT).", "2025 to 2026. Tourism Strategy 2030; 2025 Annual Report; Al Ain visitor data. dctabudhabi.ae"),
   ("Abu Dhabi Media Office.", "2024 to 2025. Al Ain tourism performance and development announcements. mediaoffice.abudhabi"),
   ("Abu Dhabi Sports Council.", "2025. Physical activity participation rate."),
   ("Abu Dhabi Real Estate Centre (ADREC).", "2025. Abu Dhabi Real Estate Market Report 2025."),
   ("Zayed Higher Organization (ZHO).", "2024. Autism services enrolment. zho.gov.ae"),
   ("World Bank.", "2023. Fertility rate, total, United Arab Emirates. data.worldbank.org"),
 ]),
 ("Real estate &amp; retail research", [
   ("Cavendish Maxwell.", "Q3 2025. Abu Dhabi Residential Market Report."),
   ("CBRE.", "Q2 to Q4 2025. UAE Real Estate Market Review."),
   ("JLL.", "Q2 2025 to Q1 2026. UAE Retail and Living Market Dynamics."),
   ("UBS Global Research.", "22 April 2026. MENA Real Estate."),
   ("Aldar Properties.", "2026. Q4 FY2025 results and investor materials. aldar.com"),
   ("Urban Planning Council.", "2016. Plan Al Ain 2030 (retail-density target)."),
 ]),
 ("Health, wealth &amp; sport", [
   ("M42.", "2025. Omics Centre and Emirati Genome Programme. m42.ae"),
   ("Cleveland Clinic Abu Dhabi.", "2025. International patient volumes."),
   ("Abu Dhabi Global Market (ADGM).", "2026. Decade performance update. adgm.com"),
   ("Henley &amp; Partners.", "2025. Private Wealth Migration Report. henleyglobal.com"),
   ("Euromonitor International.", "2024. UAE household and consumer data."),
 ]),
 ("Tourism, culture &amp; F&amp;B", [
   ("MICHELIN Guide.", "2026. Abu Dhabi and Dubai selections. guide.michelin.com"),
   ("Louvre Abu Dhabi.", "2025. Visitor figures. louvreabudhabi.ae"),
   ("Abu Dhabi Chamber.", "2024 to 2026. F&amp;B licences and sector revenue."),
   ("Time Out.", "2025 to 2026. Time Out Market Abu Dhabi; city market guides."),
 ]),
 ("Property portals &amp; press", [
   ("Bayut.", "2025. Al Ain area guides and asking prices. bayut.com"),
   ("Property Finder.", "2025. Abu Dhabi community and project data. propertyfinder.ae"),
   ("Gold's Gym UAE; GymNation.", "2026. Facility information."),
   ("The National; Gulf News; Khaleej Times; Arabian Post; Gulf Business.", "2023 to 2026. Market and project reporting."),
 ]),
]
refhtml=""
for gi,(g,items) in enumerate(refgroups):
    refhtml+=f'<div class="refgrp{" first" if gi==0 else ""}">{g}</div>'
    for o,rest in items:
        refhtml+=f'<div class="ref"><span class="o">{o}</span> {rest}</div>'
add(f'''<div class="slide">
  {header("APPENDIX · DATA SOURCES","Sources and citations,","for audit.",
   "Every figure on the preceding slides is drawn from the sources below. Data is dated 2024 to 2026 unless stated.")}
  <div class="refwrap">{refhtml}</div>
  <div class="refnote">Items flagged on-slide as estimates or triangulated, including Al Ain fine-dining venue counts, retail per-capita ratios, and autism prevalence, should be confirmed against the primary source before capital deployment. Where a single organisation issues periodic reports, the quarter or edition used is noted inline.</div>
  {foot("19")}
</div>''')

# ================================================================ ASSEMBLE
doc = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="styles.css"></head><body>
{''.join(SLIDES)}
</body></html>'''
open(os.path.join(HERE,"report.html"),"w").write(doc)
print("slides:", len(SLIDES))

from weasyprint import HTML
HTML(os.path.join(HERE,"report.html"), base_url=HERE).write_pdf(os.path.join(HERE,"The_Ranch_Al_Ain_Abu_Dhabi_Pre-Concept_Briefs.pdf"))
print("PDF written")
