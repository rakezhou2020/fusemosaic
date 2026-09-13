import json, math
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white, black
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
import pypdfium2 as pdfium
p=Path(__file__).resolve().parent;d=json.loads((p/'pattern.json').read_text(encoding='utf-8'));a=d['a'];pal=d['pal'];w=d['w'];h=d['h']

for item, name in zip(pal, ['Outline Black','Dark Green','Forest Green','Grass Green','Light Green','Vermilion','Orange','Dark Red','Bright Yellow','Cream Yellow','Brown','Khaki']): item[1] = name
c=canvas.Canvas(str(p/'Taotie-Bead-Pattern-English.pdf'),pagesize=(595.28,841.89))
def txt(x,y,s,size=10):
 c.setFillColor(black);c.setFont('Helvetica',size);c.drawString(x,y,s)
txt(35,800,'Taotie - Fuse Bead Pattern',22)
txt(35,777,'120 columns x 110 rows | 12 colors | 5,699 beads | No background',11)
c.drawImage(str(p/'preview.png'),68,340,width=458,height=420)
txt(35,325,'Color key: custom letter codes, not brand codes. Match beads to the swatches.',10)
for i,(code,name,col) in enumerate(pal):
 x=35+(i%3)*180;y=297-(i//3)*28;c.setFillColor(HexColor(col));c.rect(x,y-3,15,15,fill=1,stroke=0)
 txt(x+22,y,f'{code} {name}  {d["counts"][i]} beads',8)
for j,s in enumerate(['One cell = one bead. Read left to right, top to bottom. Bold lines mark 10 cells.','9 chart sections: top row 1-3, middle 4-6, bottom 7-9. No overlapping cells.','Approx. size: 60 x 55 cm at 5 mm spacing; 31.2 x 28.6 cm at 2.6 mm spacing.','Counting charts, not actual-size pegboard templates. Allow 10% extra per color.','All beads connect edge to edge. Support the whole piece when moving delicate tips.','Pixel-art adaptation of the original subject; some details have been simplified.']):txt(35,165-j*20,s,10)
c.showPage()
for by in range(3):
 for bx in range(3):
  x0=bx*40;y0=by*40;n=by*3+bx+1;ww=min(40,w-x0);hh=min(40,h-y0);cell=12.5;left=55;top=735
  txt(35,800,f'Section {n}/9  -  Row {by+1} / Column {bx+1}',18)
  txt(35,774,f'Columns {x0+1}-{x0+ww}, rows {y0+1}-{y0+hh} | Leave blank cells empty',11)
  for yy in range(hh):
   for xx in range(ww):
    v=a[y0+yy][x0+xx];X=left+xx*cell;Y=top-(yy+1)*cell
    if v>=0:
     col=HexColor(pal[v][2]);c.setFillColor(col);c.rect(X,Y,cell,cell,fill=1,stroke=0)
     c.setFillColor(white if v in (0,1,2,7,10) else black);c.setFont('Helvetica',6.8);c.drawCentredString(X+cell/2,Y+3.6,pal[v][0])
  for xx in range(ww+1):
   c.setStrokeColor(Color(.25,.25,.25) if xx%10==0 else Color(.68,.68,.68));c.setLineWidth(.65 if xx%10==0 else .2);c.line(left+xx*cell,top,left+xx*cell,top-hh*cell)
  for yy in range(hh+1):
   c.setStrokeColor(Color(.25,.25,.25) if yy%10==0 else Color(.68,.68,.68));c.setLineWidth(.65 if yy%10==0 else .2);c.line(left,top-yy*cell,left+ww*cell,top-yy*cell)
  c.setFillColor(black);c.setFont('Helvetica',6)
  for xx in range(ww):c.drawCentredString(left+(xx+.5)*cell,top+6,str(x0+xx+1))
  for yy in range(hh):c.drawRightString(left-6,top-(yy+.7)*cell,str(y0+yy+1))
  for i,(code,name,col) in enumerate(pal):
   X=40+(i%4)*135;Y=180-(i//4)*25;c.setFillColor(HexColor(col));c.rect(X,Y-3,12,12,fill=1,stroke=0);txt(X+17,Y,f'{code} {name}',9)
  txt(40,65,f'Join sections using global coordinates. One letter = one bead. | Page {n+1}/10',10)
  c.showPage()
c.save()
doc=pdfium.PdfDocument(str(p/'Taotie-Bead-Pattern-English.pdf'))
for i in [0,1,9]:doc[i].render(scale=1.5).to_pil().save(str(p/f'check-{i}.png'))
# Keep a page-ready detail preview derived from the PDF itself. Section 3 has a
# dense, representative grid and makes the letter-coded bead instructions legible.
detail=doc[3].render(scale=2).to_pil().crop((90,170,1130,1235))
detail.save(str(p/'chart-detail-preview.png'))
print('PDF pages:',len(doc))
