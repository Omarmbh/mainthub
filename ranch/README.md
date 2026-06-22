# The Ranch - Expansion Pre-Concept Briefs (Al Ain + Abu Dhabi)

Board-grade pre-concept briefs that re-run the Sharjah "The Ranch" framework
(Tenure to Macro to Location to Catchment to Whitespace to Concept) for two new
cities. Tenure and macro are held constant; location, catchment and whitespace
are re-run from current data, and the tenant-mix concept follows.

## Deliverables
- `The_Ranch_Al_Ain_Abu_Dhabi_Pre-Concept_Briefs.pdf` (19 slides, 16:9, pixel-perfect reference).
- `The_Ranch_Al_Ain_Abu_Dhabi_Pre-Concept_Briefs.pptx` (same deck, fully editable native
  PowerPoint, with Fraunces and Archivo embedded so it renders correctly on any machine).

Both end with a `Data sources` appendix carrying professional citations for audit. The
material decision is framed economically: a constant, income-optimised steel-led shell across
all three cities, with only a minor, tenant-led fit-out tilt. Tenant selection is the lever.

- **Al Ain**: fine-dining market hall plus a world-class wellness hangar with
  integrated longevity and recovery. The fine-dining mandate is verified against
  an acute, leaking supply gap; the premium-gym lane is sharpened toward
  integration.
- **Abu Dhabi**: an open-book whitespace search points away from the Sharjah
  formula toward a premium social, wellness and food destination (members' club,
  curated food hall, longevity pavilion) on the capital's wealth and culture
  spine. A community-corridor / family-health variant is noted as the
  alternative-site option.

## Design
- Mirrors the source deck: warm cream paper, deep brand teal (#0F6E70),
  high-contrast serif display, letter-spaced caps, white whitespace cards,
  organic parti diagrams.
- Typography: **Fraunces** (display) + **Archivo** (text), embedded. No em dashes.

## Build
```
python3 build_report.py
```
Renders `report.html` to the PDF via WeasyPrint. Fonts are local in `fonts/`
(`fonts.css`), styles in `styles.css`, all content and layout in `build_report.py`.

## Sources and confidence
Every figure is sourced inline on the slides. Underlying research, citations and
confidence flags are in `work/research_notes.md`. Key figures draw on SCAD, DCT /
Abu Dhabi Media Office, DoH, ADGM, Aldar, Cavendish Maxwell, CBRE, JLL, ADREC,
MICHELIN, Henley & Partners, Bayut and reputable press (2024 to 2026). Items that
are estimates or triangulated (for example Al Ain F&B venue counts, retail
per-capita ratios, autism prevalence) are flagged as such on-slide and in the
notes, with recommended primary pulls before capital deployment.
