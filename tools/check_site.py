from pathlib import Path
import json, yaml, re
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parent.parent
config=yaml.safe_load((root/'.pages.yml').read_text())
assert config.get('content')
def walk(entries):
    for section in entries:
        if section.get('type')=='group':
            yield from walk(section['items'])
        else:
            yield section
leaves=list(walk(config['content']))
for section in leaves:
    path=root/section['path'];assert path.exists(),path
    obj=json.loads(path.read_text(encoding='utf8'))
    assert isinstance(obj,list) if section.get('list') else isinstance(obj,dict),path
html_files=list(root.glob('*.html'))
for f in html_files:
    doc=BeautifulSoup(f.read_text(encoding='utf8'),'html.parser')
    assert len(doc.select('nav [aria-current="page"]'))==1,f
    assert not doc.select('.submenu-overview'),f
    for link in doc.select('nav a[href]'):
        href=link['href'].split('?')[0].split('#')[0]
        assert (root/href).exists(),(f.name,href)
    for item in doc.select('#research-submenu a'):
        assert not re.match(r'^\d\d\s*[·./-]',item.get_text(strip=True)),(f.name,item)
print('PASS',len(html_files),'HTML pages;',len(leaves),'CMS entries in',len(config['content']),'groups;',len(list((root/'data').glob('*.json'))),'JSON files')
