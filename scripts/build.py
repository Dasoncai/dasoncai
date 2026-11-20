"""Build the static lab from Markdown articles. Run from any working directory."""
from __future__ import annotations
import csv
import datetime as dt
import hashlib
from html import escape, unescape
from html.parser import HTMLParser
import io
import json
import math
from pathlib import Path
import re
import shutil
import sys
from urllib.parse import urlsplit, unquote
import markdown
import yaml

ROOT = Path(__file__).resolve().parents[1]
ID = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
KINDS = {'camera', 'models'}
STAGES = {'camera': {'capture', 'isp'}, 'models': {'train', 'deploy', 'optimize'}}
PLATFORMS = {'RDK X5', 'RDK S100'}
IMAGE_EXT = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}
VIDEO_EXT = {'.mp4', '.webm'}
TAGS = {'p','br','hr','h1','h2','h3','h4','h5','h6','blockquote','ul','ol','li','strong','em','del','s','pre','code','a','img','table','thead','tbody','tr','th','td','div','span','sup','sub'}
ATTRS = {'id','class','href','src','alt','title','width','height','align','start','colspan','rowspan'}

class ContentError(ValueError):
    pass

def require(ok, message):
    if not ok:
        raise ContentError(message)

def string(value, name):
    require(isinstance(value, str) and value.strip(), f'{name}: expected nonempty text')
    return value.strip()

def local_asset(value, root, suffixes=None):
    value=string(value, 'asset path')
    parsed=urlsplit(value)
    require(not parsed.scheme and not parsed.netloc and not parsed.query and not parsed.fragment, f'Asset must be a local assets/ path: {value}')
    require('\\' not in value and '%' not in value, f'Use plain forward-slash asset paths: {value}')
    path=Path(value)
    require(not path.is_absolute() and path.parts and path.parts[0]=='assets' and '..' not in path.parts, f'Asset must stay inside assets/: {value}')
    target=(root/path).resolve()
    require(target.is_relative_to((root/'assets').resolve()), f'Asset escapes assets/: {value}')
    require(target.is_file() and not (root/path).is_symlink(), f'Missing asset: {value}')
    if suffixes:
        require(target.suffix.lower() in suffixes, f'Unsupported asset format: {value}')
    return path.as_posix()

def https_url(value):
    value=string(value,'URL')
    parts=urlsplit(value)
    require(parts.scheme=='https' and parts.hostname and not parts.username and not parts.password and not any(ord(c)<32 for c in value), f'Use an HTTPS URL: {value}')
    return value

def heading_slug(value, separator):
    value=re.sub(r'<[^>]*>','',unescape(value)).strip().lower()
    return re.sub(r'[^\w\-\u4e00-\u9fff]+',separator,value).strip(separator) or 'section'

class ArticleHTML(HTMLParser):
    """Allow Markdown-generated markup and normalize local links for detail.html."""
    def __init__(self, root, source):
        super().__init__(convert_charrefs=False)
        self.root=root.resolve();self.source=source;self.result=[];self.assets=[]
    def handle_starttag(self, tag, attrs):
        require(tag in TAGS,f'Raw HTML element <{tag}> is not supported; use Markdown or media metadata')
        clean=[]
        for key,value in attrs:
            require(key in ATTRS, f'Unsupported HTML attribute: {key}')
            value=value or ''
            if key=='id':require(not value.startswith('lab-'),'HTML IDs beginning lab- are reserved')
            if key in {'href','src'}:
                require(not any(ord(c)<32 for c in value) and '\\' not in value, 'Invalid link')
                parsed=urlsplit(value)
                if parsed.scheme:
                    require(key!='src', 'Markdown images must be local; put the image in assets/')
                    require(parsed.scheme in {'https','mailto'},f'Unsupported URL scheme: {parsed.scheme}')
                    if parsed.scheme=='https':https_url(value)
                elif value.startswith('#'):
                    require(key=='href','Invalid image path')
                else:
                    require(not parsed.netloc and not parsed.query and not parsed.fragment, f'Use a local asset path or HTTPS link: {value}')
                    # Markdown links resolve relative to the .md source file.
                    target=(self.source.parent/unquote(parsed.path)).resolve()
                    require(target.is_relative_to(self.root), f'Link escapes repository: {value}')
                    normalized=target.relative_to(self.root).as_posix()
                    value=local_asset(normalized,self.root,IMAGE_EXT if key=='src' else None)
                    self.assets.append(value)
            clean.append(f' {key}="{escape(value,quote=True)}"')
        if tag=='img':clean.extend([' loading="lazy"',' decoding="async"'])
        self.result.append('<'+tag+''.join(clean)+'>')
    def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs)
    def handle_endtag(self,tag):
        require(tag in TAGS,f'Unsupported HTML element: {tag}')
        self.result.append(f'</{tag}>')
    def handle_data(self,data):self.result.append(escape(data,quote=False))
    def handle_entityref(self,name):self.result.append('&'+name+';')
    def handle_charref(self,name):self.result.append('&#'+name+';')
    def handle_comment(self,data):pass
    def handle_decl(self,data):raise ContentError('HTML declarations are not allowed')

def read_csv(path, root):
    path=local_asset(path,root,{'.csv'})
    reader=csv.DictReader(io.StringIO((root/path).read_text(encoding='utf-8-sig')))
    expected=['variant','metric','value','unit','samples']
    require(reader.fieldnames==expected, f'{path}: CSV header must be '+','.join(expected))
    rows=[]
    for number,row in enumerate(reader,2):
        require(None not in row and all(row.get(k) is not None for k in expected),f'{path}:{number}: malformed CSV row')
        for key in ['variant','metric','unit']:string(row[key],f'{path}:{number}:{key}')
        try:value=float(row['value']);samples=int(row['samples'])
        except (ValueError,TypeError):raise ContentError(f'{path}:{number}: value must be numeric and samples a positive integer')
        require(math.isfinite(value) and value>=0 and samples>0,f'{path}:{number}: invalid value or samples')
        rows.append({**row,'value':value,'samples':samples})
    require(rows,f'{path}: CSV has no measurements')
    return path,rows

def read_article(path, root):
    raw=path.read_text(encoding='utf-8-sig')
    match=re.match(r'\A---\r?\n(.*?)\r?\n---(?:\r?\n|\Z)(.*)',raw,re.S)
    require(match, f'{path.name}: YAML metadata must be enclosed by ---')
    class UniqueLoader(yaml.SafeLoader):pass
    def mapping(loader,node,deep=False):
        result={}
        for key_node,value_node in node.value:
            key=loader.construct_object(key_node,deep=deep)
            require(isinstance(key,str) and key not in result, f'{path.name}: invalid or duplicate metadata key {key}')
            result[key]=loader.construct_object(value_node,deep=deep)
        return result
    UniqueLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,mapping)
    meta=yaml.load(match.group(1),Loader=UniqueLoader)
    require(isinstance(meta,dict),f'{path.name}: metadata must be an object')
    require(isinstance(meta.get('draft',False),bool),f'{path.name}: draft must be true or false')
    if meta.get('draft',False):return None
    id=string(meta.get('id'),'id');require(ID.fullmatch(id),f'{path.name}: id must use lowercase letters, digits and hyphens')
    lang=meta.get('lang','zh');require(lang in {'zh','en'},'lang must be zh or en')
    kind=meta.get('kind');require(kind in KINDS,'kind must be camera or models')
    status=meta.get('status','planned');require(status in {'planned','verified'},'status must be planned or verified')
    platforms=meta.get('platforms');require(isinstance(platforms,list) and platforms and all(isinstance(p,str) and p in PLATFORMS for p in platforms),'platforms must list RDK X5 and/or RDK S100')
    require(len(set(platforms))==len(platforms),'Duplicate platform')
    stage=meta.get('stage');require(stage in STAGES[kind],f'{kind}: invalid stage')
    title=string(meta.get('title'),'title');description=string(meta.get('description'),'description')
    item={'id':id,'kind':kind,'platforms':platforms,'stage':stage,'status':status,'sensor':meta.get('sensor','unknown'),'shutter':meta.get('shutter','unknown'),'connection':meta.get('connection','unknown'),'family':meta.get('family','unknown'),'task':meta.get('task','unknown'),'model_version':meta.get('model_version','unknown')}
    for key in ['sensor','shutter','connection','family','task','model_version']:string(item[key],key)
    require(item['shutter'] in {'rolling','global','unknown'},'shutter must be rolling, global or unknown')
    if kind=='camera':require(item['connection'] in {'Direct MIPI','USB','SerDes','Internet Protocol Camera','unknown'},'Invalid connection')
    related=meta.get('related',[]);require(isinstance(related,list) and all(isinstance(x,str) and ID.fullmatch(x) for x in related),'related must list valid article IDs')
    require(id not in related and len(related)==len(set(related)),'Invalid related article list');item['related']=related
    assets=set();gallery=[];videos=[];evidence=[]
    for key in ['gallery','videos','evidence']:require(isinstance(meta.get(key,[]),list),f'{key} must be a list')
    for photo in meta.get('gallery',[]):
        require(isinstance(photo,dict),'gallery items must be objects')
        src=local_asset(photo.get('src'),root,IMAGE_EXT);assets.add(src)
        category=photo.get('kind','capture');require(category in {'capture','screenshot','illustration'},'gallery kind must be capture, screenshot or illustration')
        gallery.append({'src':src,'alt':string(photo.get('alt'),'gallery alt'),'caption':string(photo.get('caption'),'gallery caption'),'kind':category})
    for video in meta.get('videos',[]):
        require(isinstance(video,dict),'videos items must be objects')
        data={'title':string(video.get('title'),'video title'),'caption':string(video.get('caption'),'video caption')}
        require(bool(video.get('src')) != bool(video.get('url')),'Video must have either src or url')
        if video.get('src'):
            data['src']=local_asset(video['src'],root,VIDEO_EXT);assets.add(data['src'])
            if video.get('poster'):data['poster']=local_asset(video['poster'],root,IMAGE_EXT);assets.add(data['poster'])
            if video.get('captions'):data['captions']=local_asset(video['captions'],root,{'.vtt'});assets.add(data['captions'])
        else:data['url']=https_url(video['url'])
        videos.append(data)
    for link in meta.get('evidence',[]):
        require(isinstance(link,dict),'evidence items must be objects')
        url=link.get('url');src=link.get('src');require(bool(url)!=bool(src),'Evidence must have either src or url')
        value=https_url(url) if url else local_asset(src,root)
        if src:assets.add(value)
        evidence.append({'title':string(link.get('title'),'evidence title'),'url':value})
    performance=None
    if meta.get('performance'):
        perf=meta['performance'];require(isinstance(perf,dict),'performance must be an object')
        csv_path,rows=read_csv(perf.get('csv'),root);assets.add(csv_path)
        conditions=perf.get('conditions');require(isinstance(conditions,dict) and conditions,'performance conditions must be a nonempty mapping')
        for key,value in conditions.items():string(key,'condition name');string(value,'condition value')
        performance={'csv':csv_path,'rows':rows,'methodology':string(perf.get('methodology'),'performance methodology'),'conditions':conditions,'caption':string(perf.get('caption'),'performance caption')}
    cover=None
    if meta.get('cover'):
        cover_data=meta['cover'];require(isinstance(cover_data,dict),'cover must be an object')
        cover={'src':local_asset(cover_data.get('src'),root,IMAGE_EXT),'alt':string(cover_data.get('alt'),'cover alt'),'kind':cover_data.get('kind','capture')}
        require(cover['kind'] in {'capture','screenshot','illustration'},'Invalid cover kind');assets.add(cover['src'])
    environment=meta.get('environment',{});require(isinstance(environment,dict),'environment must be a mapping')
    for key,value in environment.items():string(key,'environment name');string(value,'environment value')
    verification={}
    if status=='verified':
        date=meta.get('verified_on')
        if isinstance(date,dt.date):date=date.isoformat()
        try:date=dt.date.fromisoformat(str(date))
        except ValueError:raise ContentError('verified_on must be an ISO date YYYY-MM-DD')
        require(environment,'Verified articles require environment versions')
        verification={'date':date.isoformat(),'scope':string(meta.get('validation_scope'),'validation_scope'),'conclusion':string(meta.get('conclusion'),'conclusion'),'limitations':string(meta.get('limitations'),'limitations')}
        require(any(x['kind']!='illustration' for x in gallery) or videos or performance or evidence,'Verified articles require non-illustrative evidence (gallery, videos, CSV or evidence links)')
    body=string(match.group(2),'Markdown body')
    renderer=markdown.Markdown(extensions=['fenced_code','tables','toc','sane_lists'],extension_configs={'tables':{'use_align_attribute':True},'toc':{'slugify':heading_slug,'permalink':False,'baselevel':1}})
    html=renderer.convert(body)
    clean=ArticleHTML(root,path);clean.feed(html);clean.close();assets.update(clean.assets)
    def flatten(tokens):
        for token in tokens:
            if token['level'] in {2,3}:yield {'id':token['id'],'title':unescape(re.sub('<[^>]*>','',token['name'])),'level':token['level']}
            yield from flatten(token.get('children',[]))
    require(all(not x['id'].startswith('lab-') for x in flatten(renderer.toc_tokens)),'Heading IDs beginning lab- are reserved')
    payload={'html':''.join(clean.result),'toc':list(flatten(renderer.toc_tokens)),'gallery':gallery,'videos':videos,'performance':performance,'evidence':evidence,'environment':environment,'verification':verification}
    return {'item':item,'lang':lang,'title':title,'description':description,'cover':cover,'article':payload,'assets':assets,'source':path}

def compile_content(root):
    records=[]
    for path in sorted((root/'content/articles').glob('*.md')):
        try:
            record=read_article(path,root)
            if record:records.append(record)
        except (ContentError,yaml.YAMLError,UnicodeError) as error:
            raise ContentError(f'{path.name}: {error}') from error
    groups={}
    for record in records:
        item=record['item'];id=item['id'];lang=record['lang']
        group=groups.setdefault(id,{})
        require(lang not in group,f'Duplicate article: {id}.{lang}')
        if group:require(item==next(iter(group.values()))['item'],f'{id}: bilingual metadata differs (platforms, status, stages or relationships)')
        group[lang]=record
    items=[];articles={};assets=set()
    for id,group in groups.items():
        primary=group.get('zh') or group['en'];item=dict(primary['item'])
        for key in ['title','description']:item[key]={lang:r[key] for lang,r in group.items()}
        item['articles']={}
        if primary['cover']:item['cover']=primary['cover']
        item['art']={'capture':'camera','isp':'isp','train':'training','deploy':'inference','optimize':'performance'}[item['stage']]
        for lang,record in group.items():
            payload=record['article'];serialized=json.dumps(payload,ensure_ascii=False,sort_keys=True)
            version=hashlib.sha256(serialized.encode()).hexdigest()[:12]
            path=f'generated/articles/{id}.{lang}.json'
            item['articles'][lang]=path+'?v='+version;articles[path]=payload;assets.update(record['assets'])
        items.append(item)
    ids={x['id'] for x in items}
    for item in items:
        for related in item['related']:require(related in ids,f'{item["id"]}: missing related article {related}')
    return items,articles,assets

def write_json(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def build(root=ROOT):
    root=root.resolve();items,articles,assets=compile_content(root)
    require(items,'No published articles; set draft: false on at least one article')
    out=root/'_site'
    require(out.resolve()==root/'_site' and not out.is_symlink(),'Refusing to replace an unexpected build directory')
    if out.exists():shutil.rmtree(out)
    out.mkdir()
    # All content is generated before replacing the deployment directory.
    for name in ['index.html','detail.html','app.js','core.mjs','style.css','favicon.svg']:
        shutil.copy2(root/name,out/name)
    for asset in assets:
        destination=out/asset;destination.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/asset,destination)
    def asset_version(path):
        return path+'?v='+hashlib.sha256((root/path).read_bytes()).hexdigest()[:12]
    def fingerprint(value,key=''):
        if isinstance(value,dict):return {k:fingerprint(v,k) for k,v in value.items()}
        if isinstance(value,list):return [fingerprint(v,key) for v in value]
        if isinstance(value,str):
            if key in {'src','poster','captions','csv','url'} and value.startswith('assets/'):return asset_version(value)
            if key=='html':return re.sub(r'((?:src|href)=")(assets/[^"]+)(")',lambda m:m[1]+escape(asset_version(unescape(m[2])),quote=True)+m[3],value)
        return value
    articles={name:fingerprint(payload) for name,payload in articles.items()}
    items=fingerprint(items)
    for item in items:
        for lang in item['articles']:
            path=f'generated/articles/{item["id"]}.{lang}.json'
            revision=hashlib.sha256(json.dumps(articles[path],ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:12]
            item['articles'][lang]=path+'?v='+revision
    for name,payload in articles.items():write_json(out/name,payload)
    write_json(out/'generated/catalog.json',items)
    version=hashlib.sha256(''.join((root/x).read_text(encoding='utf-8-sig') for x in ['app.js','core.mjs','style.css']).encode()).hexdigest()[:12]
    for file in ['index.html','detail.html']:
        text=(out/file).read_text(encoding='utf-8-sig').replace('href="style.css"',f'href="style.css?v={version}"').replace('src="app.js"',f'src="app.js?v={version}"')
        (out/file).write_text(text,encoding='utf-8')
    app=(out/'app.js').read_text(encoding='utf-8-sig').replace("from './core.mjs'",f"from './core.mjs?v={version}'")
    (out/'app.js').write_text(app,encoding='utf-8')
    (out/'.nojekyll').touch()
    print(f'Built {len(items)} cases / {len(articles)} language editions / {len(assets)} referenced assets into _site/')

if __name__=='__main__':
    try:build()
    except (ContentError,OSError) as error:
        print('Content build failed: '+str(error),file=sys.stderr);sys.exit(1)
