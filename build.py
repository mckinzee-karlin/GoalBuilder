"""Build the single-file Project VC Goal Builder.

Usage: python3 build.py
Output: index.html (self-contained; open in a browser or serve with GitHub Pages)
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
tmpl = (root / 'src' / 'index.tmpl.html').read_text()
data = json.dumps(json.load(open(root / 'data' / 'appdata.json')), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
js = ''.join((root / 'src' / f).read_text() + '\n' for f in ['skills.js', 'core.js', 'docs.js', 'views.js', 'app.js'])
css = (root / 'src' / 'style.css').read_text()
out = tmpl.replace('/*STYLE*/', css).replace('/*DATA*/', data).replace('/*JS*/', js.replace('</script', '<\\/script'))
(root / 'index.html').write_text(out)
print('index.html', len(out), 'bytes')
