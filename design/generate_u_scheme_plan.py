#!/usr/bin/env python3
"""
U-SCHEME RETAIL MASTERPLAN - ZONING PLAN GENERATOR
---------------------------------------------------
Revision of the linear scheme: the two anchor boxes (grocery, gymnasium)
are repositioned northward into the former NW / NE parking quadrants,
flanking the fixed central retail block and forming the two upper arms
of a U that opens south toward a single consolidated parking field.

The central block (retail/F&B rows, mall corridor, cross node, clinic,
wellness, BOH band, north canopy) is reproduced unchanged.

Output: design/u_scheme_zoning_plan.svg (single self-contained SVG)
"""

# ============================================================
# PARAMETERS
# ============================================================

# -- canvas / site --------------------------------------------------
CANVAS_W, CANVAS_H = 2000, 1500
SITE = (70, 70, 1930, 1430)            # parcel x0,y0,x1,y1
SETBACK = (150, 140, 1850, 1360)       # dashed setback line
AXIS_X = 1000                          # central N-S axis of symmetry

# -- anchors (the ONLY elements moved) ------------------------------
# Footprint areas preserved from the original plan (~315 x 178 units),
# rotated to portrait so the boxes read as the two arms of the U.
ANCHOR_W = 180                         # anchor width  (E-W)
ANCHOR_H = 310                         # anchor depth  (N-S); W*H = original area
ANCHOR_GAP = 60                        # clear gap between anchor and retail block
ANCHOR_TOP = 180                       # anchors aligned to northern building line

# -- central retail block (FIXED - do not move) ---------------------
BLOCK_L, BLOCK_R = 560, 1440           # block envelope
BLOCK_TOP = 180                        # canopy line (north)
CANOPY_D = 27                          # canopy depth
RETAIL_N_BOT = 400                     # north retail row bottom
CORR_BOT = 490                         # mall corridor bottom
ROW_S_BOT_W = 645                      # south row bottom, west side
ROW_S_BOT_E = 645                      # south row bottom, east side
MEP_BOT = 730                          # MEP band bottom (east only, as existing)
CENTER_STRIP = (945, 1055)             # N-S entry strip through the block
RETAIL_UNITS_NORTH = 5                 # retail units per row, north (each side)
RETAIL_UNITS_SOUTH = 2                 # retail units, south row (each side)

# -- parking (consolidated south field) -----------------------------
PARK_L, PARK_R = 280, 1720
PARK_TOP = 800
BAY_W = 28                             # perpendicular bay width
BAY_D = 55                             # bay depth
AISLE_W = 70                           # drive aisle width
MODULE_GAP = 20                        # landscape strip between double modules
PARKING_DOUBLE_MODULES = 2             # double-loaded modules
PARKING_SINGLE_ROW = True              # final single-loaded row at south
ENTRY_DRIVE_W = 80                     # central entry drive width (on axis)

# -- palette (as existing plan) -------------------------------------
C_GROCERY = "#F0A43F"                  # orange anchor
C_GYM = "#E06B6B"                      # red anchor
C_RETAIL = "#8E3D9C"                   # purple retail/F&B
C_CLINIC = "#3D6FCA"                   # blue clinic/pharmacy
C_WELLNESS = "#4CAF50"                 # green wellness/spa
C_GREY = "#7A7A7A"                     # circulation + BOH grey
C_CANOPY = "#E8762B"                   # orange canopy/clerestory
C_ARROW = "#E87722"                    # orange entry arrows
C_SITE = "#9A9A9A"                     # site/road linework
C_TREE = "#5A5A5A"                     # tree symbols
C_PARK = "#555555"                     # parking linework

FONT = "Helvetica, Arial, sans-serif"

# ============================================================
# DERIVED GEOMETRY
# ============================================================
GROC_R = BLOCK_L - ANCHOR_GAP
GROC_L = GROC_R - ANCHOR_W
GYM_L = BLOCK_R + ANCHOR_GAP
GYM_R = GYM_L + ANCHOR_W
ANCHOR_BOT = ANCHOR_TOP + ANCHOR_H     # = 490 -> flush with corridor bottom

CS_L, CS_R = CENTER_STRIP
CORR_TOP = RETAIL_N_BOT

svg = []


def rect(x0, y0, x1, y1, fill, sw=2, stroke="#111", extra=""):
    svg.append(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" '
               f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')


def line(x0, y0, x1, y1, stroke="#111", sw=1, extra=""):
    svg.append(f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}" '
               f'stroke="{stroke}" stroke-width="{sw}" {extra}/>')


def text(x, y, s, size=13, fill="#111", weight="bold", anchor="middle", extra=""):
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    svg.append(f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" '
               f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" {extra}>{s}</text>')


def label2(x, y, lines, size=13, fill="#111"):
    for i, s in enumerate(lines):
        text(x, y + i * (size + 3), s, size, fill)


def arrow(x, y0, y1, w=16):
    """Orange entry arrow from (x,y0) to (x,y1); head at y1."""
    d = 1 if y1 > y0 else -1
    head = 26 * d
    svg.append(f'<line x1="{x}" y1="{y0}" x2="{x}" y2="{y1 - head}" '
               f'stroke="{C_ARROW}" stroke-width="{w * 0.45}"/>')
    svg.append(f'<polygon points="{x - w},{y1 - head} {x + w},{y1 - head} {x},{y1}" '
               f'fill="{C_ARROW}" stroke="#B45309" stroke-width="1.5"/>')


def tree(x, y, r=10):
    svg.append(f'<use href="#tree" transform="translate({x},{y}) scale({r / 10})"/>')


# ============================================================
# DOCUMENT
# ============================================================
svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_W}" height="{CANVAS_H}" '
           f'viewBox="0 0 {CANVAS_W} {CANVAS_H}">')
svg.append(f'<rect width="{CANVAS_W}" height="{CANVAS_H}" fill="#FFFFFF"/>')

# defs: tree symbol + loading hatch
svg.append(f'''<defs>
  <g id="tree" stroke="{C_TREE}" fill="none" stroke-width="1.2">
    <circle r="10"/>
    <path d="M-6,-2 Q0,-7 6,-2 M-6,3 Q0,7 6,3"/>
  </g>
  <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse"
           patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="8" stroke="#888" stroke-width="1.5"/>
  </pattern>
</defs>''')

# ------------------------------------------------------------
# 1. SITE: parcel, perimeter roads, setback line
# ------------------------------------------------------------
sx0, sy0, sx1, sy1 = SITE
svg.append(f'<rect x="{sx0}" y="{sy0}" width="{sx1 - sx0}" height="{sy1 - sy0}" rx="60" '
           f'fill="none" stroke="{C_SITE}" stroke-width="1.5"/>')
# surrounding road edges (context)
svg.append(f'<rect x="20" y="20" width="{CANVAS_W - 40}" height="{CANVAS_H - 40}" rx="90" '
           f'fill="none" stroke="{C_SITE}" stroke-width="1" stroke-dasharray="14 8"/>')
# internal ring road (light)
svg.append(f'<rect x="195" y="185" width="1610" height="1130" rx="40" '
           f'fill="none" stroke="{C_SITE}" stroke-width="1"/>')

# setback line (dashed orange)
bx0, by0, bx1, by1 = SETBACK
svg.append(f'<rect x="{bx0}" y="{by0}" width="{bx1 - bx0}" height="{by1 - by0}" '
           f'fill="none" stroke="{C_ARROW}" stroke-width="1.5" stroke-dasharray="16 10"/>')
text(bx0 + 65, by0 - 8, "SETBACK LINE", 10, "#444", "bold")

# ------------------------------------------------------------
# 2. CONSOLIDATED PARKING FIELD (southern half)
# ------------------------------------------------------------
total_bays = 0
halves = [(PARK_L, AXIS_X - ENTRY_DRIVE_W / 2), (AXIS_X + ENTRY_DRIVE_W / 2, PARK_R)]
y = PARK_TOP
rows = []
for _ in range(PARKING_DOUBLE_MODULES):
    rows.append((y, "double"))
    y += 2 * BAY_D + AISLE_W + MODULE_GAP
if PARKING_SINGLE_ROW:
    rows.append((y, "single"))

for ry, kind in rows:
    bands = ([(ry, ry + BAY_D), (ry + BAY_D + AISLE_W, ry + 2 * BAY_D + AISLE_W)]
             if kind == "double" else [(ry + AISLE_W, ry + AISLE_W + BAY_D)])
    for hx0, hx1 in halves:
        for b0, b1 in bands:
            n = int((hx1 - hx0) // BAY_W)
            w = n * BAY_W
            x0 = hx0 + (hx1 - hx0 - w) / 2
            total_bays += n
            rect(x0, b0, x0 + w, b1, "none", 1.2, C_PARK)
            for i in range(1, n):
                line(x0 + i * BAY_W, b0, x0 + i * BAY_W, b1, C_PARK, 0.9)

aisle_mid = PARK_TOP + BAY_D + AISLE_W / 2
text(AXIS_X - ENTRY_DRIVE_W / 2 - 230, aisle_mid + 4,
     f"CONSOLIDATED PARKING FIELD — {total_bays} BAYS", 13, "#555")

# central entry drive on axis
line(AXIS_X - ENTRY_DRIVE_W / 2, PARK_TOP - 20, AXIS_X - ENTRY_DRIVE_W / 2, by1, C_SITE, 1.2)
line(AXIS_X + ENTRY_DRIVE_W / 2, PARK_TOP - 20, AXIS_X + ENTRY_DRIVE_W / 2, by1, C_SITE, 1.2)

# ------------------------------------------------------------
# 3. CENTRAL RETAIL BLOCK (FIXED - reproduced as existing)
# ------------------------------------------------------------
# grey circulation base: corridor + N/S entry strips + node
rect(BLOCK_L, CORR_TOP, BLOCK_R, CORR_BOT, C_GREY)                    # mall corridor
rect(CS_L, BLOCK_TOP, CS_R, CORR_TOP, C_GREY)                         # north entry strip
rect(CS_L, CORR_BOT, CS_R, MEP_BOT, C_GREY)                           # south entry strip
# covered links across the gaps into both anchors
rect(GROC_R, CORR_TOP, BLOCK_L, CORR_BOT, C_GREY, 1.5)
rect(BLOCK_R, CORR_TOP, GYM_L, CORR_BOT, C_GREY, 1.5)

# central cross / pinwheel node
node = (CS_L - 25, CORR_TOP - 70, CS_R + 25, CORR_BOT + 70)
rect(*node, C_GREY)
line(node[0], node[1], node[2], node[3], "#222", 1.2)
line(node[2], node[1], node[0], node[3], "#222", 1.2)

# orange mall centreline (gentle bow) + axis line
svg.append(f'<path d="M {BLOCK_L + 18} {CORR_BOT - 32} Q {AXIS_X} {CORR_TOP + 18} '
           f'{BLOCK_R - 18} {CORR_BOT - 32}" fill="none" stroke="{C_ARROW}" stroke-width="3"/>')
line(AXIS_X, BLOCK_TOP + 8, AXIS_X, MEP_BOT - 8, C_ARROW, 1.5, 'stroke-dasharray="10 8"')

# canopy / clerestory strips (stepped, north edge of retail)
for (c0, c1) in [(BLOCK_L + 15, CS_L), (CS_R, BLOCK_R - 15)]:
    mid = (c0 + c1) / 2
    outer = (c0, mid) if c0 < AXIS_X else (mid, c1)
    inner = (mid, c1) if c0 < AXIS_X else (c0, mid)
    rect(outer[0], BLOCK_TOP, outer[1], BLOCK_TOP + CANOPY_D, C_CANOPY, 1.5)
    rect(inner[0], BLOCK_TOP + 10, inner[1], BLOCK_TOP + CANOPY_D, C_CANOPY, 1.5)

# north retail rows (double-loaded, purple)
for (r0, r1) in [(BLOCK_L, CS_L), (CS_R, BLOCK_R)]:
    rect(r0, BLOCK_TOP + CANOPY_D, r1, RETAIL_N_BOT, C_RETAIL)
    uw = (r1 - r0) / RETAIL_UNITS_NORTH
    for i in range(1, RETAIL_UNITS_NORTH):
        line(r0 + i * uw, BLOCK_TOP + CANOPY_D, r0 + i * uw, RETAIL_N_BOT, "#111", 1.2)
    ymid = (BLOCK_TOP + CANOPY_D + RETAIL_N_BOT) / 2 - 6
    label2(r0 + (r1 - r0) * 0.28, ymid, ["RETAIL/", "F&B"])
    label2(r0 + (r1 - r0) * 0.74, ymid, ["RETAIL/", "F&B"])

# south row, west side: clinic + retail
rect(BLOCK_L, CORR_BOT, BLOCK_L + 130, ROW_S_BOT_W, C_CLINIC)
label2(BLOCK_L + 65, (CORR_BOT + ROW_S_BOT_W) / 2 - 6, ["CLINIC /", "PHARMACY"])
rect(BLOCK_L + 130, CORR_BOT, CS_L, ROW_S_BOT_W, C_RETAIL)
uw = (CS_L - BLOCK_L - 130) / RETAIL_UNITS_SOUTH
for i in range(1, RETAIL_UNITS_SOUTH):
    line(BLOCK_L + 130 + i * uw, CORR_BOT, BLOCK_L + 130 + i * uw, ROW_S_BOT_W, "#111", 1.2)
label2((BLOCK_L + 130 + CS_L) / 2, (CORR_BOT + ROW_S_BOT_W) / 2 - 6, ["RETAIL/", "F&B"])

# south row, east side: retail + SERV. + wellness, MEP band below
rect(CS_R, CORR_BOT, CS_R + 125, ROW_S_BOT_E, C_RETAIL)
label2(CS_R + 62, (CORR_BOT + ROW_S_BOT_E) / 2 - 6, ["RETAIL/", "F&B"])
rect(CS_R + 125, CORR_BOT, CS_R + 275, ROW_S_BOT_E, C_GREY)
text(CS_R + 200, CORR_BOT + 28, "ELEC. + TELE.", 9)
text(CS_R + 200, (CORR_BOT + ROW_S_BOT_E) / 2 + 8, "SERV.")
rect(CS_R + 275, CORR_BOT, BLOCK_R, ROW_S_BOT_E, C_WELLNESS)
label2((CS_R + 275 + BLOCK_R) / 2, (CORR_BOT + ROW_S_BOT_E) / 2 - 6,
       ["WELLNESS", "CENTER / SPA"], 12)
rect(CS_R + 125, ROW_S_BOT_E, BLOCK_R, MEP_BOT, C_GREY)
text((CS_R + 125 + BLOCK_R) / 2, (ROW_S_BOT_E + MEP_BOT) / 2 + 5, "MEP SERV.")

# ------------------------------------------------------------
# 4. ANCHORS (the only repositioned elements) - upper arms of the U
# ------------------------------------------------------------
for (ax0, ax1, fill, lines) in [
        (GROC_L, GROC_R, C_GROCERY, ["ANCHOR STORE", "- GROCERY -"]),
        (GYM_L, GYM_R, C_GYM, ["GYMNASIUM"])]:
    rect(ax0, ANCHOR_TOP, ax1, ANCHOR_BOT, fill, 2.5)
    line(ax0, ANCHOR_TOP, ax1, ANCHOR_BOT, "#111", 1.2)               # X cross-brace
    line(ax1, ANCHOR_TOP, ax0, ANCHOR_BOT, "#111", 1.2)
    yc = (ANCHOR_TOP + ANCHOR_BOT) / 2 - (7 * (len(lines) - 1))
    label2((ax0 + ax1) / 2, yc, lines, 14)

# loading / unloading bays on the anchors' OUTER edges, off the courtyard
for (lx0, lx1) in [(GROC_L - 70, GROC_L), (GYM_R, GYM_R + 70)]:
    rect(lx0, 360, lx1, ANCHOR_BOT, "url(#hatch)", 1.5)
    label2((lx0 + lx1) / 2, 398, ["LOADING /", "UNLOAD.", "AREA"], 8)

# ------------------------------------------------------------
# 5. ENTRIES (orange arrows): primary from south, on axis
# ------------------------------------------------------------
arrow(AXIS_X, 1410, 1300, 18)                  # primary vehicular entry, south
arrow(AXIS_X, 790, MEP_BOT + 12)               # pedestrian arrival into south strip
arrow((GROC_R + BLOCK_L) / 2, 660, CORR_BOT + 12, 12)   # west courtyard entry
arrow((BLOCK_R + GYM_L) / 2, 660, CORR_BOT + 12, 12)    # east courtyard entry
arrow(AXIS_X, 122, BLOCK_TOP - 4, 12)          # north pedestrian entry

# ------------------------------------------------------------
# 6. COLUMN GRIDLINES (vertical, with bubbles)
# ------------------------------------------------------------
n_grid = 9
for i in range(n_grid):
    gx = BLOCK_L + i * (BLOCK_R - BLOCK_L) / (n_grid - 1)
    line(gx, 114, gx, 1400, "#222", 0.6)
    svg.append(f'<circle cx="{gx}" cy="100" r="13" fill="#fff" stroke="#222" stroke-width="1"/>')
    text(gx, 104, str(i + 1), 11, "#222", "normal")

# ------------------------------------------------------------
# 7. LANDSCAPE: perimeter buffer + courtyard + parking strips
# ------------------------------------------------------------
import math
def jitter(i, a=6):
    return a * math.sin(i * 12.9898)

# north buffer between / above the anchors and over the canopy zone
for i, x in enumerate(range(530, 1480, 52)):
    tree(x, 158 + jitter(i), 11)
for side in (-1, 1):
    for i in range(4):
        tree(AXIS_X + side * (590 + i * 55), 150 + jitter(i), 9)
# west / east edge columns
for i, yy in enumerate(range(230, 740, 62)):
    tree(173, yy + jitter(i), 10)
    tree(1827, yy + jitter(i + 3), 10)
# courtyard clusters flanking the parking approach (inside the U)
for side in (-1, 1):
    for i in range(6):
        tree(AXIS_X + side * (560 + (i % 3) * 60), 560 + (i // 3) * 130 + jitter(i), 10)
# strips between parking modules and along south buffer
for ry, kind in rows[1:]:
    for i, x in enumerate(range(330, 1700, 110)):
        tree(x, ry - MODULE_GAP / 2, 7)
for i, x in enumerate(range(280, 1740, 92)):
    tree(x, 1396 + jitter(i, 4), 9)

# ------------------------------------------------------------
# 8. ANNOTATION: substation, north arrow, caption
# ------------------------------------------------------------
rect(1755, 1290, 1815, 1335, "#fff", 2)
text(1785, 1318, "SUB.", 9)
text(1785, 1350, "SUBSTATION", 8)

svg.append(f'<g transform="translate(1900,120)">'
           f'<circle r="22" fill="none" stroke="#222" stroke-width="1.5"/>'
           f'<polygon points="0,-16 6,10 0,4 -6,10" fill="#222"/>'
           f'<text y="40" font-family="{FONT}" font-size="12" font-weight="bold" '
           f'text-anchor="middle" fill="#222">N</text></g>')

text(80, 1470, "U-SCHEME ZONING PLAN — ANCHORS RELOCATED NORTH, "
     "PARKING CONSOLIDATED SOUTH", 11, "#888", "normal", "start")

svg.append('</svg>')

# ============================================================
out = __file__.rsplit('/', 1)[0] + "/u_scheme_zoning_plan.svg"
with open(out, "w") as f:
    f.write("\n".join(svg))
print(f"wrote {out} ({total_bays} parking bays)")
