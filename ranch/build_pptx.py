#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE RANCH - EXPANSION BRIEFS - editable PowerPoint generator.
Mirrors the PDF deck as native, editable PPTX (text boxes, shapes, tables).
Fonts: Fraunces (display) + Archivo (text). Install the TTFs in ranch/fonts
for exact fidelity. No em dashes.
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

HERE = os.path.dirname(os.path.abspath(__file__))

# ---- palette ----
def C(h): return RGBColor.from_string(h)
PAPER=C("F3EBE1"); PAPER2=C("ECE2D5"); TEAL=C("0F6E70"); TEALD=C("0A4E50")
TEAL2=C("3E9CA0"); INK=C("2C2A27"); INKSOFT=C("6B655D"); LINE=C("C9BDAC")
WHITE=C("FCF9F4"); RUST=C("C2703D"); CLAY=C("B5654A"); GOLD=C("D8A24A")
SAGE=C("7E8F6A"); STONE=C("9C8E7A"); DARK=C("0A4E50"); LTEAL=C("7FC9CB")
CHIP_PRIM=TEAL; CHIP_SEC=C("D9E4E0"); CHIP_AV=C("E8DCD3")
DISP="Fraunces"; SANS="Archivo"
ML=0.78; CW=11.773; SW=13.333; SH=7.5

prs=Presentation(); prs.slide_width=Inches(SW); prs.slide_height=Inches(SH)
BLANK=prs.slide_layouts[6]

def _nostyle(shp):
    # remove the theme <p:style> (drops inherited shadow / effect / line refs)
    sp=shp._element; st=sp.find(qn('p:style'))
    if st is not None: sp.remove(st)
    shp.shadow.inherit=False

def slide(bg=PAPER):
    s=prs.slides.add_slide(BLANK)
    r=s.shapes.add_shape(MSO_SHAPE.RECTANGLE,0,0,prs.slide_width,prs.slide_height)
    r.fill.solid(); r.fill.fore_color.rgb=bg; r.line.fill.background(); _nostyle(r)
    return s

def _spc(run,pts):
    run.font._rPr.set('spc',str(int(pts*100)))

def tb(s,l,t,w,h,paras,anchor=MSO_ANCHOR.TOP):
    box=s.shapes.add_textbox(Inches(l),Inches(t),Inches(w),Inches(h))
    tf=box.text_frame; tf.word_wrap=True; tf.vertical_anchor=anchor
    tf.margin_left=0;tf.margin_right=0;tf.margin_top=0;tf.margin_bottom=0
    for i,pa in enumerate(paras):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph()
        p.alignment=pa.get('align',PP_ALIGN.LEFT)
        if 'sa' in pa: p.space_after=Pt(pa['sa'])
        if 'sb' in pa: p.space_before=Pt(pa['sb'])
        if 'ls' in pa: p.line_spacing=pa['ls']
        for run in pa['runs']:
            text,font,size,color=run[0],run[1],run[2],run[3]
            bold=run[4] if len(run)>4 else False
            ital=run[5] if len(run)>5 else False
            spc=run[6] if len(run)>6 else None
            r=p.add_run(); r.text=text
            r.font.name=font; r.font.size=Pt(size); r.font.bold=bold; r.font.italic=ital
            r.font.color.rgb=color
            if spc: _spc(r,spc)
    return box

def rect(s,l,t,w,h,fill,line=None,lw=0.75,rounded=False,rad=0.12):
    shp=s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE,
        Inches(l),Inches(t),Inches(w),Inches(h))
    if fill is None: shp.fill.background()
    else: shp.fill.solid(); shp.fill.fore_color.rgb=fill
    if line is None: shp.line.fill.background()
    else: shp.line.color.rgb=line; shp.line.width=Pt(lw)
    _nostyle(shp)
    if rounded:
        try: shp.adjustments[0]=rad
        except Exception: pass
    return shp

def hline(s,l,t,w,color=TEALD,wpt=1.5):
    ln=s.shapes.add_connector(2,Inches(l),Inches(t),Inches(l+w),Inches(t))
    ln.line.color.rgb=color; ln.line.width=Pt(wpt); ln.shadow.inherit=False
    return ln

CAPS=PP_ALIGN.LEFT
def eyebrow(s,txt,dark=False,top=0.55):
    tb(s,ML,top,CW,0.3,[{'runs':[(txt.upper(),SANS,10.5,(LTEAL if dark else TEAL),True,False,3.8)]}])

def header(s,ey,l1,l2,sub=None,dark=False,subw=9.3,ytitle=0.82):
    eyebrow(s,ey,dark)
    c1=WHITE if dark else TEALD; c2=LTEAL if dark else TEAL2
    tb(s,ML,ytitle,CW,1.7,[
        {'runs':[(l1,DISP,40,c1,True)],'ls':0.95,'sa':2},
        {'runs':[(l2,DISP,33,c2,False,True)],'ls':0.95},
    ])
    if sub:
        tb(s,ML,2.55,subw,0.9,[{'runs':[(sub,SANS,12.5,(C('CFE3E3') if dark else INKSOFT))],'ls':1.12}])
    return 3.15

def footer(s,page,dark=False):
    c=C('6FA9AB') if dark else INKSOFT; m=C('2E6E70') if dark else LINE
    y=6.96
    tb(s,ML,y,3.5,0.25,[{'runs':[("AFHAD PROPERTIES",SANS,8,c,True,False,2.6)]}])
    tb(s,4.4,y,4.5,0.25,[{'runs':[("THE RANCH  |  EXPANSION BRIEFS",SANS,8,m,True,False,2.6)]}],)
    tb(s,11.6,y,0.95,0.25,[{'runs':[(page,SANS,8,c,True,False,2.6)]} ],)

def srcline(s,txt):
    tb(s,ML,6.62,CW,0.4,[{'runs':[(txt,SANS,8,STONE,False,True)],'ls':1.1}])

# ============================================================ SLIDE 1 COVER
s=slide()
eyebrow(s,"AFHAD PROPERTIES   |   CONCEPT DIRECTION   |   FOR BOARD REVIEW")
tb(s,ML,0.95,CW,1.9,[
    {'runs':[("The Ranch",DISP,46,TEALD,True)],'ls':0.95,'sa':2},
    {'runs':[("Al Ain & Abu Dhabi",DISP,37,TEAL2,False,True)],'ls':0.95},
])
tb(s,ML,2.95,9.6,0.9,[{'runs':[("Two expansion pre-concept briefs. The Sharjah blueprint, taken city by city. Tenure and macro held constant; location, catchment and whitespace re-run from the data; the concept rebuilt to fit what each city cannot buy today.",SANS,12.5,INKSOFT)],'ls':1.15}])
# databand
hline(s,ML,5.9,CW,TEALD,2)
band=[("Origin asset","The Ranch at Al Rahmaniya, Sharjah"),
      ("Tenure (constant)","Musataha / usufruct, income led"),
      ("Levers re-run","Location, Catchment, Whitespace"),
      ("This document","Al Ain brief, Abu Dhabi brief")]
bw=CW/4
for i,(lb,vv) in enumerate(band):
    x=ML+i*bw
    tb(s,x,6.02,bw-0.2,0.3,[{'runs':[(lb.upper(),SANS,9,TEAL,True,False,2.6)]}])
    tb(s,x,6.28,bw-0.2,0.4,[{'runs':[(vv,SANS,11.5,INK,True)]}])
footer(s,"01")

# ============================================================ SLIDE 2 APPROACH
s=slide()
header(s,"Our approach","Concept is the output of data,","not an input.",
   "The same six-step value chain that produced the Sharjah asset. Tenure and macro carry over unchanged. The middle three levers are re-run from each city's own data, and the concept follows.")
chain=[("01","Tenure","Musataha. No terminal value. Income must clear the hurdle inside the lease term.","CONSTANT",False),
 ("02","Macro","Community retail under-built across the UAE. Emirati villa catchments insulated from expat flows.","CONSTANT",False),
 ("03","Location","Re-run per city. Plot logic, frontage and arrival change with the site.","RE-RUN",True),
 ("04","Catchment","Re-run per city. Who lives within the drive-time ring, and what they cannot buy.","RE-RUN",True),
 ("05","Whitespace","Re-run per city. The verified category gaps that become the tenant spine.","RE-RUN",True),
 ("06","Concept","The output, not the input. Rebuilt tenant mix on the same industrial typology.","OUTPUT",True)]
cw=CW/6; y=3.55
for i,(n,t,b,tag,lever) in enumerate(chain):
    x=ML+i*cw
    tb(s,x,y,cw-0.25,0.5,[{'runs':[(n,DISP,26,TEAL2,False,True)]}])
    hline(s,x,y+0.62,cw-0.35,TEALD,2)
    tb(s,x,y+0.72,cw-0.25,0.4,[{'runs':[(t,DISP,15,TEALD,True)]}])
    tb(s,x,y+1.12,cw-0.3,1.2,[{'runs':[(b,SANS,9,INKSOFT)],'ls':1.12}])
    chip=rect(s,x,y+2.35,(0.95 if lever else 1.05),0.22,(TEAL if lever else C("E3D9C9")),rounded=True,rad=0.3)
    tf=chip.text_frame; tf.margin_top=0;tf.margin_bottom=0; tf.word_wrap=False
    p=tf.paragraphs[0]; p.alignment=PP_ALIGN.CENTER
    r=p.add_run(); r.text=tag; r.font.name=SANS; r.font.size=Pt(7.5); r.font.bold=True
    r.font.color.rgb=(WHITE if lever else C("8A7B63")); _spc(r,1.8)
footer(s,"02")

# ============================================================ helper: divider
def divider(s,brief,ey,l1,l2,sub,page):
    tb(s,ML,2.05,CW,0.4,[{'runs':[(brief,DISP,17,LTEAL,False,True,1.5)]}])
    eyebrow(s,ey,dark=True,top=2.55)
    tb(s,ML,2.95,CW,1.7,[
        {'runs':[(l1,DISP,46,WHITE,True)],'ls':0.95,'sa':2},
        {'runs':[(l2,DISP,37,LTEAL,False,True)],'ls':0.95}])
    tb(s,ML,4.75,8.6,0.9,[{'runs':[(sub,SANS,12.5,C('CFE3E3'))],'ls':1.15}])
    footer(s,page,dark=True)

# ============================================================ helper: stats + points
def stat_row(s,stats,y=3.35):
    n=len(stats); w=CW/n
    for i,(lb,vv,cap) in enumerate(stats):
        x=ML+i*w
        tb(s,x,y,w-0.25,0.3,[{'runs':[(lb.upper(),SANS,9.5,TEAL,True,False,2.4)]}])
        tb(s,x,y+0.28,w-0.25,0.7,[{'runs':[(vv,DISP,42,TEALD,True)]}])
        tb(s,x,y+1.02,w-0.25,0.4,[{'runs':[(cap,DISP,12,INKSOFT,False,True)],'ls':1.05}])

def points(s,pts,y,cols=2):
    w=CW/cols; rows=(len(pts)+cols-1)//cols
    rh=1.05
    for i,(h,b) in enumerate(pts):
        r=i//cols; c=i%cols; x=ML+c*w
        yy=y+r*rh
        tb(s,x,yy,w-0.35,0.3,[{'runs':[(h,DISP,14,TEALD,True)]}])
        tb(s,x,yy+0.27,w-0.4,0.7,[{'runs':[(b,SANS,11,INKSOFT)],'ls':1.12}])

# ============================================================ SLIDE 3 AL AIN DIVIDER
s=slide(DARK)
divider(s,"Brief One","The Garden City  ·  Emirati heartland","The Ranch","at Al Ain",
  "A fine-dining market hall and a world-class wellness hangar for the UAE's most concentrated Emirati villa city. The mandate is set; the data confirms why it holds.","03")

# ============================================================ SLIDE 4 AL AIN LOCATION
s=slide()
header(s,"3 · Location & catchment","An affluent Emirati villa city,","under-retailed by design.",
  "Al Ain is the Emirati heartland of Abu Dhabi emirate: a family, villa-dominant, owner-occupier market held below global retail density by design.")
stat_row(s,[("Al Ain region population","987K","SCAD 2024, +4.4% year on year"),
            ("UAE National share","~31%","highest of any major UAE city"),
            ("Average villa asking","4.9M","AED, Bayut 2025 listings"),
            ("Retail per resident, 2030","1.1","sqm, Plan Al Ain 2030 target")])
points(s,[("Owner-occupier Emirati wealth.","Villa households across Al Towayya, Asharej, Falaj Hazzaa and Al Jimi. End-user demand, low speculative volatility."),
          ("A committed villa pipeline.","10,316 villas across five developments inside the AED 106bn Abu Dhabi housing programme, Aldar's Al Oyoun Village among them."),
          ("A fast-growing tourism spine.","473,100 hotel guests in FY2025, up 9%. DCT positions Al Ain on culture, wellness and adventure."),
          ("Enclosed malls only.","Roughly seven hypermarket-anchored malls, repetitive anchors, no open-air lifestyle destination.")],4.95)
srcline(s,"Sources: SCAD 2024; Bayut 2025; Plan Al Ain 2030 / Aldar 2016; Abu Dhabi Media Office & DCT 2025; Arabian Post 2026. Villa pricing is asking, not registered transactions.")
footer(s,"04")

# ============================================================ SLIDE 5 AL AIN MANDATE
s=slide(PAPER2)
header(s,"4 · The mandate, verified","Fine dining and a world-class gym,","confirmed by the gap.",
  "The mandate set fine dining and a world-class fitness anchor. Targeted verification holds it up: the fine-dining whitespace is acute, the premium-gym lane real but contested, sharpening the brief toward integrated wellness.")
stat_row(s,[("Fine-dining venues in Al Ain","0","vs 56 in Abu Dhabi city, 100+ in Dubai (MICHELIN 2026)"),
            ("Premium large-format gyms","1","one credible incumbent at scale; rest value or hotel"),
            ("Integrated wellness + longevity","None","no operator combines training, recovery, longevity")])
points(s,[("Fine dining: an acute, leaking gap.","The upper tier is four to five ageing hotel restaurants. Affluent residents drive to Abu Dhabi and Dubai. Note: licensed dining sits in hotels, so the model favours a hotel partnership or destination format."),
          ("Gym: win on integration, not a box.","A single large-format incumbent holds the pure-fitness lane. The open ground is the integrated facility: premium training plus recovery, longevity and boutique studios, where no incumbent exists.")],4.85)
srcline(s,"Sources: MICHELIN Guide 2026; Gold's Gym UAE 2026; GymNation 2026; operator triangulation (Rotana, Danat, Radisson, Mercure) 2025 to 2026. Venue counts are triangulated estimates.")
footer(s,"05")

# ============================================================ table helper
def make_table(s,headers,rows,colw,y,vcol,h=0.42):
    nr=len(rows)+1; nc=len(headers)
    tw=sum(colw)
    gt=s.shapes.add_table(nr,nc,Inches(ML),Inches(y),Inches(tw),Inches(h*nr)).table
    # neutral style
    tbl=gt._tbl
    tbl.tblPr.set('firstRow','0'); tbl.tblPr.set('bandRow','0')
    se=tbl.tblPr.find(qn('a:tableStyleId'))
    if se is None:
        se=tbl.tblPr.makeelement(qn('a:tableStyleId'),{}); tbl.tblPr.append(se)
    se.text='{2D5ABB26-0587-4C30-8999-92F81FD0307C}'
    for ci,wd in enumerate(colw): gt.columns[ci].width=Inches(wd)
    for ri in range(nr): gt.rows[ri].height=Inches(h)
    def setcell(cell,text,size,color,bold,fill,align=PP_ALIGN.LEFT,ital=False):
        cell.fill.solid(); cell.fill.fore_color.rgb=fill
        cell.margin_left=Inches(0.08);cell.margin_right=Inches(0.05)
        cell.margin_top=Inches(0.03);cell.margin_bottom=Inches(0.03)
        cell.vertical_anchor=MSO_ANCHOR.MIDDLE
        tf=cell.text_frame; tf.word_wrap=True
        p=tf.paragraphs[0]; p.alignment=align
        r=p.add_run(); r.text=text; r.font.name=SANS; r.font.size=Pt(size)
        r.font.bold=bold; r.font.italic=ital; r.font.color.rgb=color
    for ci,hd in enumerate(headers):
        setcell(gt.cell(0,ci),hd.upper(),8.5,TEAL,True,PAPER)
        _spc(gt.cell(0,ci).text_frame.paragraphs[0].runs[0],1.6)
    for ri,row in enumerate(rows,start=1):
        for ci,val in enumerate(row):
            if ci==vcol:
                v=val
                fill={'PRIMARY':CHIP_PRIM,'SECONDARY':CHIP_SEC,'AVOID':CHIP_AV}.get(v,PAPER)
                tc={'PRIMARY':WHITE,'SECONDARY':TEAL,'AVOID':C('9A6B53')}.get(v,INK)
                setcell(gt.cell(ri,ci),v,8.5,tc,True,fill,PP_ALIGN.CENTER)
            elif ci==0:
                setcell(gt.cell(ri,ci),val,11,TEALD,True,PAPER)
            else:
                setcell(gt.cell(ri,ci),val,9.5,INK,False,PAPER)
    return gt

# ============================================================ SLIDE 6 AL AIN WHITESPACE MAP
s=slide()
header(s,"5 · Whitespace map","Where supply ends","and demand begins.",
  "Each category scored on Al Ain supply against assessed catchment demand. The primary gaps form the spine of the tenant programme.")
make_table(s,["Category","Supply","Demand","Verdict","Note"],
 [["Destination fine dining","ABSENT","HIGH","PRIMARY","Zero standalone venues; demand leaks to Abu Dhabi and Dubai"],
  ["Integrated wellness + longevity","ABSENT","HIGH","PRIMARY","Recovery and longevity exist only as fragmented clinics"],
  ["World-class gym (large format)","THIN","HIGH","PRIMARY","One incumbent; differentiate via integration"],
  ["Open-air lifestyle retail","ABSENT","HIGH","PRIMARY","No operating open-air village; one hybrid in build"],
  ["Specialty & artisan grocer","THIN","MED","SECONDARY","Anchors are mass hypermarkets, Carrefour and LuLu"],
  ["Children's enrichment","THIN","MED","SECONDARY","Young, family-weighted, high-National catchment"],
  ["Hypermarket, fashion, perfumes","SATURATED","-","AVOID","Replicated across seven enclosed malls"]],
 [3.4,1.25,1.05,1.35,4.65],3.25,3)
footer(s,"06")

# ============================================================ cards helper
def cards(s,items,y=3.35,note=None,page="07"):
    n=len(items); gap=0.18; w=(CW-gap*(n-1))/n
    for i,(num,title,stat,cap,body) in enumerate(items):
        x=ML+i*(w+gap)
        rect(s,x,y,w,3.05,WHITE,LINE,0.75)
        rect(s,x,y,w,0.05,TEAL)
        tb(s,x+0.13,y+0.14,w-0.26,0.3,[{'runs':[(num,DISP,15,TEAL2,False,True)]}])
        tb(s,x+0.13,y+0.5,w-0.26,0.6,[{'runs':[(title,DISP,14.5,TEALD,True)],'ls':0.98}])
        tb(s,x+0.13,y+1.15,w-0.26,0.5,[{'runs':[(stat,DISP,26,TEALD,True)]}])
        tb(s,x+0.13,y+1.62,w-0.26,0.3,[{'runs':[(cap,DISP,10.5,INKSOFT,False,True)]}])
        tb(s,x+0.13,y+1.95,w-0.26,1.0,[{'runs':[(body,SANS,9.5,INK)],'ls':1.12}])
    if note: srcline(s,note)
    footer(s,page)

# ============================================================ SLIDE 7 AL AIN CARDS
s=slide(PAPER2)
header(s,"5 · The whitespaces","Five categories","Al Ain cannot buy today.",
  "The primary and supporting whitespaces, drawn from the category map. These are the spine of the proposed tenant mix.")
cards(s,[("01","Destination fine dining","Zero","standalone today","Chef-driven, licensed via hotel partnership. The category the catchment leaves the city to buy."),
 ("02","Gym & wellness hangar","1,500+","target members","World-class training fused with recovery and longevity. Integration is the moat, not square metres."),
 ("03","Longevity & recovery","None","integrated today","Cryotherapy, contrast, IV and diagnostics under one roof. Fragmented clinics only."),
 ("04","Specialty grocer","Daily","repeat trips","Fresh-focused artisan format. The base-load engine away from mass hypermarket anchors."),
 ("05","Open-air lifestyle","First","mover position","A true open-air village, experience-led, differentiated from the one hybrid now in build.")],
 note="Children's enrichment and a multi-specialty clinic sit alongside as complementary secondary whitespaces.",page="07")

# ============================================================ pillars helper
def pillars(s,items,y=3.35,page="08"):
    w=CW/3
    for i,(ey,t,k,bl) in enumerate(items):
        x=ML+i*w
        tb(s,x,y,w-0.3,0.3,[{'runs':[(ey,SANS,9,C('8A7B63'),True,False,2.0)]}])
        tb(s,x,y+0.3,w-0.35,0.6,[{'runs':[(t,DISP,19,TEALD,True)],'ls':0.98}])
        tb(s,x,y+0.92,w-0.3,0.3,[{'runs':[(k,SANS,9,TEAL,True,False,2.0)]}])
        paras=[{'runs':[("•  "+b,SANS,11,INKSOFT)],'ls':1.12,'sa':5} for b in bl]
        tb(s,x,y+1.25,w-0.4,2.0,paras)
    footer(s,page)

# ============================================================ SLIDE 8 AL AIN CONCEPT
s=slide()
header(s,"6 · The concept","The Ranch at Al Ain,","built on three pillars.",
  "Not a mall, not a hypermarket extension. A fine-dining market hall paired with a world-class wellness hangar, on the same industrial-village typology.")
pillars(s,[("01 / PILLAR","Fine-dining market hall","WEEKLY DIFFERENTIATOR",
   ["Ten to fifteen curated chef-driven operators anchor the hall as a regional weekend destination.",
    "Operable glazing to shaded terraces for year-round dining.",
    "Licensed dining via hotel partnership; the rest reads as a premium destination."]),
  ("02 / PILLAR","Gym, wellness & longevity","FOOTFALL GENERATOR",
   ["A world-class steel-portal hangar: 1,500-plus members, daylit training floors.",
    "Structured recovery, longevity diagnostics and boutique studios under one roof.",
    "The integration no incumbent offers, driving cross-visits to F&B."]),
  ("03 / PILLAR","Daily lifestyle anchor","BASE-LOAD REVENUE",
   ["Specialty artisan grocer, clinic, pharmacy and service kiosks for daily trips.",
    "An open-air village format the city does not yet have.",
    "Cross-subsidises the fine-dining anchor through ramp-up."])],page="08")

# ============================================================ parti helper
def parti_slide(s,ey,l1,l2,sub,vols,north,note_left,note_right,page):
    header(s,ey,l1,l2,sub)
    # panel
    py=3.05; ph=2.55
    rect(s,ML,py,CW,ph,WHITE,LINE,0.75)
    # ribbons
    rect(s,ML+0.15,py+0.18,CW-0.3,0.32,C("E7DDCC"))
    nt=tb(s,ML,py+0.2,CW,0.28,[{'runs':[(north,SANS,8,C('8A7B63'),True,False,2.0)]}],anchor=MSO_ANCHOR.MIDDLE)
    nt.text_frame.paragraphs[0].alignment=PP_ALIGN.CENTER
    rect(s,ML+0.15,py+ph-0.5,CW-0.3,0.32,C("E7DDCC"))
    bt=tb(s,ML,py+ph-0.48,CW,0.28,[{'runs':[("CONSOLIDATED PARKING · PRIMARY ARRIVAL · SOUTH",SANS,8,C('8A7B63'),True,False,2.0)]}])
    bt.text_frame.paragraphs[0].alignment=PP_ALIGN.CENTER
    # volumes laid across
    bx=ML+0.35; bw=CW-0.7; vy=py+0.72; vh=1.15
    for (lab,sub2,col,xf,wf) in vols:
        x=bx+xf*bw; w=wf*bw
        rect(s,x,vy,w,vh,col,INK,1.0,rounded=True,rad=0.18)
        narrow=wf<0.12
        t=tb(s,x,vy+0.32,w,0.5,[
            {'runs':[(lab,DISP,(10 if narrow else 12.5),WHITE,True)],'align':PP_ALIGN.CENTER,'sa':1},
            {'runs':[(sub2,SANS,8.5,C('F3EBE1'),False,True)],'align':PP_ALIGN.CENTER}])
        t.text_frame.word_wrap=False
    # ratio bar + captions
    ry=py+ph+0.18
    tb(s,ML,ry,6.6,0.25,[{'runs':[("SHELL · CONSTANT, INCOME-OPTIMISED",SANS,9,TEAL,True,False,2.0)]}])
    rect(s,ML,ry+0.27,5.5,0.32,TEALD)
    rect(s,ML+5.5,ry+0.27,1.05,0.32,STONE)
    t1=tb(s,ML,ry+0.3,5.5,0.26,[{'runs':[("STEEL-LED SHELL",SANS,9,WHITE,True,False,1.5)]}]); t1.text_frame.paragraphs[0].alignment=PP_ALIGN.CENTER
    t2=tb(s,ML+5.5,ry+0.3,1.05,0.26,[{'runs':[("FIT-OUT",SANS,9,WHITE,True,False,1.0)]}]); t2.text_frame.paragraphs[0].alignment=PP_ALIGN.CENTER
    tb(s,ML,ry+0.66,6.6,0.5,[{'runs':[(note_left,SANS,9.5,INKSOFT)],'ls':1.1}])
    rx=ML+7.1
    tb(s,rx,ry,4.5,0.25,[{'runs':[("THE ONLY TILT · MINOR, TENANT-LED",SANS,9,TEAL,True,False,2.0)]}])
    tb(s,rx,ry+0.27,4.5,0.8,[{'runs':[(note_right,SANS,9.5,INKSOFT)],'ls':1.1}])
    footer(s,page)

# ============================================================ SLIDE 9 AL AIN PARTI
s=slide(PAPER2)
parti_slide(s,"6 · The parti & build logic","One shell,","the mix is the lever.",
  "Gym hangar tilted west, fine-dining hall on axis, specialty grocer tilted east, with gallery seams between. The envelope is held constant and cheap; the tenant mix does the work.",
  [("GYM & WELLNESS","steel portal hangar",TEAL,0.0,0.21),
   ("GALLERY","seam",GOLD,0.225,0.075),
   ("FINE-DINING HALL","destination anchor",CLAY,0.315,0.27),
   ("GALLERY","seam",GOLD,0.605,0.075),
   ("SPECIALTY GROCER","fresh market",RUST,0.70,0.21)],
  "PARKING & LANDSCAPE RIBBON · NORTH",
  "Identical to Sharjah: steel portal frame, lightweight envelope, slab on grade, build matched to the usufruct. Income clears the hurdle, so no masonry premium is chased.",
  "Fit-out concentrates where rent pays for it: the fine-dining hall. Wellness directs spend to MEP, not finishes. The lever is tenant selection, not structure.","09")

# ============================================================ SLIDE 10 AD DIVIDER
s=slide(DARK)
divider(s,"Brief Two","The Capital  ·  open-book whitespace","The Ranch","at Abu Dhabi",
  "Not a replica of the Sharjah formula. A data-led whitespace search points the capital to a premium social, wellness and food destination for its affluent residents, wealth-migration cohort and cultural footfall.","10")

# ============================================================ SLIDE 11 AD LOCATION
s=slide()
header(s,"3 · Location & catchment","A capital catchment,","not a commuter suburb.",
  "Abu Dhabi is not Sharjah. The defining catchment is the wealth and culture spine of Saadiyat, Al Maryah and Al Reem: affluent residents, the ADGM professional base, and a record stream of relocating capital and visitors.")
stat_row(s,[("Emirate population","4.1M","SCAD 2024, +7.5%, +51% over the decade"),
            ("ADGM workforce","+51%","to 44,339; institutions +135% since 2021"),
            ("Millionaire migration","No.1","UAE leads the world, ~9,800 in 2025"),
            ("Visitors, 2025","26.6M","record; DCT targets 39.3m by 2030")])
points(s,[("Wealth is arriving, and concentrating.","The UAE ranks first for millionaire migration; ADGM's workforce is up 51% to 44,339. This cohort has no home base in the capital."),
          ("A cultural district now fully live.","Louvre drew 1.4m visitors in 2025; Zayed National and Natural History museums opened late 2025; Guggenheim follows in 2026. Cultural footfall hit 8.6m."),
          ("A tight, space-starved market.","Prime retail near 95% occupancy, Grade A office vacancy below 1.5%, rents climbing. Quality lifestyle space is scarce."),
          ("The location lever moves.","Where Sharjah was a single villa ring, the capital concept addresses a destination catchment on the islands.")],4.95)
srcline(s,"Sources: SCAD 2024; ADGM 2026; Henley & Partners 2025; DCT Abu Dhabi 2025 Annual Report; Louvre Abu Dhabi 2025; CBRE / JLL Q3 to Q4 2025. Some figures are UAE-level and flagged.")
footer(s,"11")

# ============================================================ SLIDE 12 AD POSITIONING
s=slide(PAPER2)
header(s,"4 · Positioning","Why the capital needs","a different anchor.",
  "Copying the Sharjah mix of supermarket, gym and generic F&B would add undifferentiated stock to a space-starved market. The capital's own gaps point to social, wellness and food.")
stat_row(s,[("Members' clubs in the capital","0","no Soho House in the UAE; ecosystem in Dubai"),
            ("Curated food halls operating","0","Time Out Abu Dhabi unbuilt; Dubai runs three"),
            ("Longevity clinics licensed","~2","world-first DoH licence category, Oct 2024")])
points(s,[("The social and food gaps are stark.","No members' or creative club in the capital and no operating curated food hall, while Dubai runs a deep stack of both. For a city leading global wealth migration, the clearest whitespace."),
          ("The state has placed its wellness bet.","The DoH created the world's first Healthy Longevity Medicine Centre licence; M42 runs the largest omics centre outside the US on an 800,000-genome programme. Preventative wellness is policy.")],4.85)
srcline(s,"Sources: FACT Magazine 2026; Time Out 2026; The National 2021 to 2026; DoH 2024 to 2025; M42 2025.")
footer(s,"12")

# ============================================================ SLIDE 13 AD WHITESPACE MAP
s=slide()
header(s,"5 · Whitespace map","What the capital","cannot buy locally.",
  "An open-book scan across social, food, wellness, sport and culture. The verdicts redraw the anchor away from the Sharjah template.")
make_table(s,["Category","Supply","Demand","Verdict","Note"],
 [["Members' & creative social club","ABSENT","HIGH","PRIMARY","No club in the capital; ADGM cohort up 51%, wealth inflow No.1"],
  ["Curated food hall & artisan market","ABSENT","HIGH","PRIMARY","Time Out Abu Dhabi unbuilt; Dubai runs three live"],
  ["Longevity & preventative wellness","THIN","HIGH","PRIMARY","World-first licence; only ~2 facilities; cluster in Dubai"],
  ["Arts-led experiential F&B","THIN","HIGH","PRIMARY","Saadiyat anchors now live; on-site retail still thin"],
  ["Boutique fitness & recovery","THIN","HIGH","SECONDARY","No category leader; activity participation at 60%"],
  ["Specialist family health, STEAM","THIN","MED","SECONDARY","Real gaps; better suited to a community-corridor site"],
  ["Core IVF, big-box gym, attractions","SATURATED","-","AVOID","Sovereign and Miral incumbents already at scale"]],
 [3.55,1.15,1.0,1.3,4.7],3.25,3)
footer(s,"13")

# ============================================================ SLIDE 14 AD CARDS
s=slide(PAPER2)
header(s,"5 · The whitespaces","Five categories","that fit the capital, not the template.",
  "The redrawn spine: social, food and wellness lead, riding the capital's wealth inflow and cultural halo, with fitness and convenience as the base load.")
cards(s,[("01","Members' & creative club","0","in the capital today","A members' and family-office house with workspace, dining and programming for the ADGM and wealth cohort."),
 ("02","Curated food hall","0","operating, vs 3 in Dubai","A destination market hall of curated chef-driven operators. The capital's clearest food whitespace."),
 ("03","Longevity & wellness","~2","clinics in the capital","Preventative, diagnostic, longevity-led care. A world-first licence with the cluster still in Dubai."),
 ("04","Arts-led F&B","8.6M","cultural visits, 2025","Experiential, culturally-themed dining and retail riding the now-live Saadiyat museum district."),
 ("05","Boutique fitness","No","category leader","Reformer, strength and structured recovery studios riding a steep activity curve.")],
 note="Specialist family health and STEAM are strong capital-wide gaps better matched to a community-corridor site such as Al Shamkha, carried as the alternative-site option.",page="14")

# ============================================================ SLIDE 15 AD CONCEPT
s=slide()
header(s,"6 · The concept","The Ranch at Abu Dhabi,","a social and wellness house.",
  "The same industrial-village typology, re-anchored for the capital. A members' club and food hall generate the destination draw; longevity and fitness generate the footfall; curated convenience carries the base load.")
pillars(s,[("01 / PILLAR","Social & food destination","WEEKLY DIFFERENTIATOR",
   ["A members' and creative club paired with a curated, chef-driven food hall.",
    "Programming, dining and family-office lounge for the ADGM and wealth cohort.",
    "Two categories the capital cannot buy today."]),
  ("02 / PILLAR","Wellness & longevity","FOOTFALL GENERATOR",
   ["A preventative and longevity pavilion aligned to the world-first DoH licence.",
    "Boutique fitness, reformer and structured recovery.",
    "The wellness draw the affluent base now leaves the city to find."]),
  ("03 / PILLAR","Curated daily base","BASE-LOAD REVENUE",
   ["Specialty grocer, arts-led cafes and service kiosks for daily trips.",
    "Indoor racquet and movement courts as cross-visit amenity.",
    "Cross-subsidises the club and wellness anchors through ramp-up."])],page="15")

# ============================================================ SLIDE 16 AD PARTI
s=slide(PAPER2)
parti_slide(s,"6 · The parti & build logic","One shell,","the mix is the lever.",
  "Wellness and fitness tilted west, the curated food hall on axis, the members' club tilted east, with gallery seams between. Same constant envelope as Al Ain; the tenant mix does the work.",
  [("GYM & WELLNESS","wellness pavilion",TEAL,0.0,0.21),
   ("GALLERY","seam",GOLD,0.225,0.075),
   ("CURATED FOOD HALL","destination anchor",CLAY,0.315,0.27),
   ("GALLERY","seam",GOLD,0.605,0.075),
   ("MEMBERS' CLUB","members lounge",SAGE,0.70,0.21)],
  "ARRIVAL & LANDSCAPE FORECOURT · NORTH",
  "The same steel portal shell and lightweight envelope as Al Ain. The usufruct is cleared by income, so the envelope stays cheap and fast in both cities.",
  "Fit-out concentrates on the members' club and food hall, where rent and membership pay for it. The wellness pavilion spends on MEP. The lever is tenant selection.","16")

# ============================================================ SLIDE 17 COMPARISON
s=slide()
header(s,"One blueprint, three cities","What holds,","and what is re-run.",
  "The constants travel. The levers are re-run from each city's data, and the concept follows. Same typology, three different answers.")
make_table(s,["Lever","Sharjah · Al Rahmaniya","Al Ain","Abu Dhabi"],
 [["Tenure","Musataha, income led","Musataha, income led","Musataha, income led"],
  ["Macro","Community retail under-built","Community retail under-built","Community retail under-built"],
  ["Catchment","~48K Emirati villa, Y5","~987K region, ~31% National","Capital wealth & culture spine"],
  ["Whitespace","F&B, gym, grocer, wellness","Fine dining, gym + longevity","Social club, food hall, longevity"],
  ["Concept anchor","Market hall + wellness hangar","Fine-dining hall + wellness hangar","Social & wellness house"],
  ["Shell (constant)","Steel-led, income-optimised","Steel-led, income-optimised","Steel-led, income-optimised"],
  ["Fit-out tilt (minor)","Standard","To the fine-dining hall","To the club and food hall"]],
 [2.6,3.05,3.05,3.05],3.2,99,h=0.46)
footer(s,"17")

# ============================================================ SLIDE 18 CLOSE
s=slide(DARK)
tb(s,ML,2.0,CW,0.4,[{'runs':[("For Board Review",DISP,17,LTEAL,False,True,1.0)]}])
eyebrow(s,"AFHAD PROPERTIES · JUNE 2026",dark=True,top=2.5)
tb(s,ML,2.9,CW,1.6,[
    {'runs':[("The Ranch",DISP,44,WHITE,True)],'ls':0.95,'sa':2},
    {'runs':[("Al Ain & Abu Dhabi",DISP,35,LTEAL,False,True)],'ls':0.95}])
points2=[("Al Ain","Fine-dining market hall and a world-class wellness hangar, integrating longevity and recovery, for the Emirati heartland. Mandate verified by an acute dining gap."),
         ("Abu Dhabi","A social and wellness house, members' club, curated food hall and longevity pavilion, on the capital's wealth and culture spine. The gaps the city leaves to Dubai today.")]
for i,(h,b) in enumerate(points2):
    x=ML+i*(CW/2)
    tb(s,x,4.7,CW/2-0.4,0.3,[{'runs':[(h,DISP,14,LTEAL,True)]}])
    tb(s,x,5.0,CW/2-0.5,0.9,[{'runs':[(b,SANS,11,C('CFE3E3'))],'ls':1.12}])
tb(s,ML,6.05,9.5,0.6,[{'runs':[("Both on the same industrial-village typology and Musataha logic. Next step: site selection and plot-specific massing per city, then catchment isochrones on the confirmed parcels.",SANS,11,C('9FCFD0'))],'ls':1.12}])
footer(s,"18",dark=True)

# ============================================================ SLIDE 19 SOURCES
s=slide()
header(s,"Appendix · data sources","Sources and citations,","for audit.",
  "Every figure on the preceding slides is drawn from the sources below. Data is dated 2024 to 2026 unless stated.")
refgroups=[
 ("Official statistics & government",[
   ("Statistics Centre Abu Dhabi (SCAD).","2024. Population estimates, Abu Dhabi Emirate and Al Ain Region. scad.gov.ae"),
   ("Department of Health, Abu Dhabi (DoH).","2024 to 2025. HLMC licensing; ABA guidelines; births and IVF data. doh.gov.ae"),
   ("Department of Culture and Tourism (DCT).","2025 to 2026. Tourism Strategy 2030; 2025 Annual Report; Al Ain data. dctabudhabi.ae"),
   ("Abu Dhabi Media Office.","2024 to 2025. Al Ain tourism and development announcements."),
   ("Abu Dhabi Sports Council.","2025. Physical activity participation rate."),
   ("Abu Dhabi Real Estate Centre (ADREC).","2025. Abu Dhabi Real Estate Market Report 2025."),
   ("Zayed Higher Organization (ZHO).","2024. Autism services enrolment. zho.gov.ae"),
   ("World Bank.","2023. Fertility rate, total, UAE. data.worldbank.org")]),
 ("Real estate & retail research",[
   ("Cavendish Maxwell.","Q3 2025. Abu Dhabi Residential Market Report."),
   ("CBRE.","Q2 to Q4 2025. UAE Real Estate Market Review."),
   ("JLL.","Q2 2025 to Q1 2026. UAE Retail and Living Market Dynamics."),
   ("UBS Global Research.","22 April 2026. MENA Real Estate."),
   ("Aldar Properties.","2026. Q4 FY2025 results and investor materials. aldar.com"),
   ("Urban Planning Council.","2016. Plan Al Ain 2030 (retail-density target).")]),
 ("Health, wealth & sport",[
   ("M42.","2025. Omics Centre and Emirati Genome Programme. m42.ae"),
   ("Cleveland Clinic Abu Dhabi.","2025. International patient volumes."),
   ("Abu Dhabi Global Market (ADGM).","2026. Decade performance update. adgm.com"),
   ("Henley & Partners.","2025. Private Wealth Migration Report. henleyglobal.com"),
   ("Euromonitor International.","2024. UAE household and consumer data.")]),
 ("Tourism, culture & F&B",[
   ("MICHELIN Guide.","2026. Abu Dhabi and Dubai selections. guide.michelin.com"),
   ("Louvre Abu Dhabi.","2025. Visitor figures. louvreabudhabi.ae"),
   ("Abu Dhabi Chamber.","2024 to 2026. F&B licences and sector revenue."),
   ("Time Out.","2025 to 2026. Time Out Market Abu Dhabi; market guides.")]),
 ("Property portals & press",[
   ("Bayut.","2025. Al Ain area guides and asking prices. bayut.com"),
   ("Property Finder.","2025. Abu Dhabi community and project data."),
   ("Gold's Gym UAE; GymNation.","2026. Facility information."),
   ("The National; Gulf News; Khaleej Times; Arabian Post; Gulf Business.","2023 to 2026. Reporting.")])]
# two columns: split groups
colA=refgroups[:2]; colB=refgroups[2:]
def render_refs(groups):
    paras=[]
    for gi,(g,items) in enumerate(groups):
        paras.append({'runs':[(g.upper(),SANS,9,TEAL,True,False,1.8)],'sb':(0 if gi==0 else 8),'sa':3})
        for o,rest in items:
            paras.append({'runs':[(o+" ",SANS,9,INK,True),(rest,SANS,9,INK)],'ls':1.12,'sa':3})
    return paras
tb(s,ML,3.05,5.55,3.6,render_refs(colA))
tb(s,ML+6.0,3.05,5.55,3.6,render_refs(colB))
tb(s,ML,6.5,CW,0.4,[{'runs':[("Items flagged on-slide as estimates or triangulated (Al Ain fine-dining venue counts, retail per-capita ratios, autism prevalence) should be confirmed against the primary source before capital deployment.",SANS,8,STONE,False,True)],'ls':1.1}])
footer(s,"19")

# ============================================================ SAVE
out=os.path.join(HERE,"The_Ranch_Al_Ain_Abu_Dhabi_Pre-Concept_Briefs.pptx")
prs.save(out)
print("saved",out,"slides:",len(prs.slides._sldIdLst))
