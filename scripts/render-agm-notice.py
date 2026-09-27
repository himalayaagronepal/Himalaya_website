"""Rebuild the notice from the supplied DOCX using its original Preeti runs.

Run this script, then node scripts/render-agm-notice.cjs. Browser rendering
preserves the original legacy-font text; Unicode conversion is audit-only.
"""
from pathlib import Path
from zipfile import ZipFile
from lxml import etree
import base64
import hashlib
import html
import json
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / 'audit' / 'agm'
ASSETS = ROOT / 'public' / 'notices'
SOURCE = Path(r'C:\Users\Acer\Downloads\Agm Notice Final 2083-07-07 First.docx')
FONT = Path(r'C:\Users\Acer\AppData\Local\Microsoft\Windows\Fonts\preeti.ttf')
AUDIT.mkdir(parents=True, exist_ok=True)
ASSETS.mkdir(parents=True, exist_ok=True)
shutil.copyfile(SOURCE, ASSETS / 'agm-notice-2083.docx')
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = '{' + NS['w'] + '}'
with ZipFile(SOURCE) as archive:
    document = etree.fromstring(archive.read('word/document.xml'))
paragraphs = []
html_paragraphs = []
for index, paragraph in enumerate(document.findall('w:body/w:p', NS)):
    runs = []
    for run in paragraph.findall('w:r', NS):
        text = ''.join((child.text or '') if child.tag == W + 't' else '\t' if child.tag == W + 'tab' else '\n' if child.tag == W + 'br' else '' for child in run)
        if not text:
            continue
        fonts = run.find('w:rPr/w:rFonts', NS)
        font = fonts.get(W + 'ascii', 'Preeti') if fonts is not None else 'Preeti'
        # This literal Latin URL incorrectly uses Preeti in the DOCX.
        # Keep its exact text and use the Latin font shown in the newspaper.
        if text.strip() == 'www.himalayaagronepal.com':
            font = 'Times New Roman'
        bold = run.find('w:rPr/w:b', NS) is not None
        underline = run.find('w:rPr/w:u', NS) is not None
        key = (font, bold, underline)
        if runs and tuple(runs[-1]['style']) == key:
            runs[-1]['text'] += text
        else:
            runs.append({'text': text, 'style': key})
    plain = ''.join(run['text'] for run in runs)
    paragraphs.append({'index': index, 'text': plain, 'runs': runs})
    if not plain.strip():
        continue
    parts = []
    for run in runs:
        font, bold, underline = run['style']
        classes = ['preeti' if font == 'Preeti' else 'latin']
        if bold:
            classes.append('bold')
        if underline:
            classes.append('underlined')
        escaped = html.escape(run['text']).replace('\t', '<span class="tab">\t</span>')
        # The opening English parenthesis on the date line also inherited
        # Preeti in the source. Preserve the character, with its Latin glyph.
        if index == 10:
            escaped = escaped.replace(' (', ' <span class="latin">(</span>')
        parts.append(f'<span class="{" ".join(classes)}">{escaped}</span>')
    html_paragraphs.append(f'<p id="p{index}" class="p{index}">{"".join(parts)}</p>')

font_base64 = base64.b64encode(FONT.read_bytes()).decode('ascii')
logo_base64 = base64.b64encode((ROOT / 'public' / 'logo_original.png').read_bytes()).decode('ascii')
stylesheet = '''
* { box-sizing: border-box; }
html,body { margin: 0; background: white; color: #111; }
body { width: 1100px; }
.notice { margin: 14px; border: 2px solid #222; padding: 22px 28px 25px; background: white; }
.letterhead { position: relative; padding-left: 125px; text-align: center; margin-bottom: 12px; }
.logo { position: absolute; left: -5px; top: 0; width: 130px; height: 145px; object-fit: contain; filter: grayscale(1) contrast(1.4); }
p { margin: 0 0 5px; font-family: Preeti; font-size: 27px; line-height: 1.12; overflow-wrap: normal; }
.preeti { font-family: Preeti; }
.latin { font-family: 'Times New Roman'; font-size: .74em; }
.bold { font-weight: 700; }
.underlined { text-decoration: underline; text-underline-offset: 3px; }
.tab { display: inline-block; width: 16px; }
.p0 { font-size: 45px; font-weight: 700; line-height: 1.08; margin: 0; }
.p1 { font-size: 42px; line-height: 1.0; margin: 0 0 5px; }
.p2,.p3,.p4 { font-size: 24px; line-height: 1.05; margin-bottom: 3px; }
.p5 { display: table; font-size: 37px; font-weight: 700; padding: 5px 24px 6px; margin: 12px auto 8px; background: #171717; color: #fff; text-align: center; line-height: 1.05; }
.p6 { text-align: center; font-size: 25px; margin-bottom: 15px; }
.p7 { margin-bottom: 7px; }
.p8 { text-align: justify; margin-bottom: 12px; }
.p9,.p13,.p25 { margin-top: 8px; }
.p10,.p11,.p12 { margin-bottom: 3px; }
.p14 { margin-bottom: 4px; }
.p15,.p17,.p19,.p21,.p22,.p23,.p24 { margin-bottom: 3px; }
.p16,.p18,.p20 { margin-left: 29px; text-align: justify; }
.p26,.p27,.p28,.p29,.p30,.p31 { padding-left: 30px; text-indent: -30px; text-align: justify; margin-bottom: 8px; }
.p32,.p33 { text-align: right; margin-bottom: 0; }
.p32 { margin-top: 15px; }
@page { margin: 0; }
'''
head = ''.join(html_paragraphs[:5])
body = ''.join(html_paragraphs[5:])
page = f'''<!DOCTYPE html><html lang="ne"><head><meta charset="utf-8"><title>First AGM Notice 2083</title><style>@font-face {{font-family: Preeti;src: url(data:font/ttf;base64,{font_base64}) format('truetype');font-weight: 400;}}{stylesheet}</style></head><body><main class="notice"><header class="letterhead"><img class="logo" src="data:image/png;base64,{logo_base64}" alt="">{head}</header>{body}</main></body></html>'''
(AUDIT / 'notice-layout.html').write_text(page, encoding='utf-8')
(AUDIT / 'source-runs.json').write_text(json.dumps(paragraphs, ensure_ascii=False, indent=2), encoding='utf-8')
# Audit-only conversion respects font boundaries and joins contiguous runs
# because legacy vowel positioning can cross bold/style boundaries.
sys.path.insert(0, str(AUDIT / 'converter'))
try:
    from npttf2utf import FontMapper
    converter = FontMapper(str(AUDIT / 'converter' / 'npttf2utf' / 'map.json'))
    transcript = []
    for p in paragraphs:
        groups = []
        for r in p['runs']:
            font = r['style'][0]
            if groups and groups[-1][0] == font:
                groups[-1][1] += r['text']
            else:
                groups.append([font, r['text']])
        transcript.append(''.join(converter.map_to_unicode(t, from_font='Preeti') if f == 'Preeti' else t for f, t in groups))
    (AUDIT / 'notice-unicode.txt').write_text('\n\n'.join(transcript), encoding='utf-8')
except ImportError:
    pass
report = {
    'source': str(SOURCE),
    'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    'original_document_paragraphs': len(paragraphs),
    'render_method': 'Original DOCX text runs rendered using original Preeti font; English runs use Times New Roman, with newspaper-style layout.',
    'font_correction': 'The final literal website URL and opening English parenthesis on the date line retain their exact text but use Times New Roman instead of the source Preeti font, matching the newspaper.',
    'source_copy': str(ASSETS / 'agm-notice-2083.docx'),
}
(AUDIT / 'source-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
