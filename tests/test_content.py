import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import yaml

spec=importlib.util.spec_from_file_location('lab_build',Path(__file__).resolve().parents[1]/'scripts/build.py')
lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)

class ContentTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.root=Path(self.temp.name)
  (self.root/'content/articles').mkdir(parents=True);(self.root/'assets/case').mkdir(parents=True)
  self.meta={'id':'test-case','lang':'zh','kind':'camera','title':'测试相机','description':'测试摘要','status':'planned','platforms':['RDK X5'],'sensor':'TEST123','shutter':'global','connection':'Internet Protocol Camera','stage':'capture','related':[]}
 def write(self,meta=None,body='## 点亮步骤\n\n测试 **正文**。\n\n```shell\necho "<script>"\n```',name='test.zh.md'):
  path=self.root/'content/articles'/name
  path.write_text('---\n'+yaml.safe_dump(meta or self.meta,allow_unicode=True,sort_keys=False)+'---\n\n'+body,encoding='utf-8');return path
 def asset(self,name,data=b'test'):
  path=self.root/'assets/case'/name;path.write_bytes(data);return 'assets/case/'+name
 def compile(self):return lab.compile_content(self.root)
 def test_markdown_heading_code_and_dynamic_metadata(self):
  self.write();items,articles,_=self.compile();self.assertEqual(items[0]['sensor'],'TEST123');self.assertEqual(items[0]['connection'],'Internet Protocol Camera');self.assertEqual(items[0]['status'],'planned')
  page=articles['generated/articles/test-case.zh.json'];self.assertEqual(page['toc'][0]['title'],'点亮步骤');self.assertIn('&lt;script&gt;',page['html']);self.assertIn('<strong>正文</strong>',page['html'])
 def test_drafts_are_not_published(self):
  self.write({'draft':True});self.assertEqual(self.compile(),([],{},set()))
 def test_duplicate_language_is_rejected(self):
  self.write();self.write(name='other.zh.md')
  with self.assertRaisesRegex(lab.ContentError,'Duplicate article'):self.compile()
 def test_bilingual_versions_share_id_and_keep_own_text(self):
  self.write();self.write({**self.meta,'lang':'en','title':'Camera','description':'English description'},body='## Setup\n\nEnglish.',name='test.en.md')
  items,articles,_=self.compile();self.assertEqual(set(items[0]['articles']),{'zh','en'});self.assertEqual(items[0]['title']['en'],'Camera');self.assertEqual(len(articles),2)
 def test_bilingual_status_mismatch_rejected(self):
  self.write();self.write({**self.meta,'lang':'en','platforms':['RDK S100']},name='test.en.md')
  with self.assertRaisesRegex(lab.ContentError,'bilingual metadata differs'):self.compile()
 def test_verified_requires_environment_and_scope(self):
  self.write({**self.meta,'status':'verified'})
  with self.assertRaises(lab.ContentError):self.compile()
 def test_verified_illustration_alone_is_not_evidence(self):
  src=self.asset('diagram.png');meta={**self.meta,'status':'verified','verified_on':'2026-11-20','environment':{'SDK':'test'},'validation_scope':'test scope','conclusion':'test conclusion','limitations':'test limitations','gallery':[{'src':src,'alt':'test','caption':'synthetic illustration','kind':'illustration'}]}
  self.write(meta)
  with self.assertRaisesRegex(lab.ContentError,'non-illustrative evidence'):self.compile()
 def test_verified_media_and_csv_are_compiled(self):
  image=self.asset('capture.webp');video=self.asset('demo.mp4');captions=self.asset('captions.vtt');csv=self.asset('metrics.csv',b'variant,metric,value,unit,samples\nbaseline,inference,12.5,ms,100\noptimized,inference,0,ms,100\n')
  meta={**self.meta,'status':'verified','verified_on':'2026-11-20','environment':{'SDK':'test'},'validation_scope':'test scope','conclusion':'test conclusion','limitations':'test limitations','cover':{'src':image,'alt':'test','kind':'screenshot'},'gallery':[{'src':image,'alt':'test','caption':'test image','kind':'screenshot'}],'videos':[{'src':video,'poster':image,'captions':captions,'title':'test','caption':'test'}],'performance':{'csv':csv,'caption':'synthetic test only','methodology':'fixture','conditions':{'SDK':'fixture'}}}
  self.write(meta);items,articles,assets=self.compile();page=next(iter(articles.values()));self.assertEqual(items[0]['status'],'verified');self.assertEqual(page['verification']['date'],'2026-11-20');self.assertEqual(page['performance']['rows'][0]['value'],12.5);self.assertEqual(page['performance']['rows'][1]['value'],0);self.assertEqual(len(assets),4)
 def test_markdown_relative_images_and_downloads(self):
  self.asset('capture.png');self.asset('capture.log');self.write(body='## 图像\n\n![实拍](../../assets/case/capture.png)\n\n[日志](../../assets/case/capture.log)')
  _,articles,assets=self.compile();html=next(iter(articles.values()))['html'];self.assertIn('src="assets/case/capture.png"',html);self.assertIn('href="assets/case/capture.log"',html);self.assertEqual(len(assets),2)
 def test_missing_asset_fails(self):
  self.write(body='![missing](../../assets/case/missing.png)')
  with self.assertRaisesRegex(lab.ContentError,'Missing asset'):self.compile()
 def test_asset_path_escape_fails(self):
  self.write({**self.meta,'cover':{'src':'assets/../secret.png','alt':'bad'}})
  with self.assertRaises(lab.ContentError):self.compile()
 def test_unsafe_html_and_links_fail(self):
  for body in ['<script>alert(1)</script>','[bad](javascript:alert)','<img src="../../assets/case/capture.png" onerror="bad">','<iframe src="https://example.com"></iframe>']:
   with self.subTest(body=body):
    self.write(body=body)
    with self.assertRaises(lab.ContentError):self.compile()
 def test_csv_rejects_nan_missing_samples_and_wrong_columns(self):
  for content in ['variant,metric,value,unit,samples\na,b,NaN,ms,100\n','variant,metric,value,unit,samples\na,b,1,ms,0\n','variant,metric,value,unit,samples\n','metric,value\na,1\n']:
   with self.subTest(content=content):
    csv=self.asset('metrics.csv',content.encode());self.write({**self.meta,'performance':{'csv':csv,'caption':'test','methodology':'test','conditions':{'SDK':'test'}}})
    with self.assertRaises(lab.ContentError):self.compile()
 def test_broken_related_reference_fails(self):
  self.write({**self.meta,'related':['missing-case']})
  with self.assertRaisesRegex(lab.ContentError,'missing related'):self.compile()
 def test_duplicate_yaml_key_fails(self):
  path=self.write();text=path.read_text(encoding='utf-8');path.write_text(text.replace('id: test-case','id: test-case\nid: other'),encoding='utf-8')
  with self.assertRaisesRegex(lab.ContentError,'duplicate metadata key'):self.compile()
 def test_external_video_link_supported(self):
  self.write({**self.meta,'videos':[{'url':'https://www.bilibili.com/video/BVtest/','title':'test','caption':'test'}]});_,articles,_=self.compile();self.assertIn('url',next(iter(articles.values()))['videos'][0])
 def test_public_templates_can_create_planned_articles(self):
  repo=Path(__file__).resolve().parents[1]
  for template in ['camera.zh.md','model.zh.md']:
   with self.subTest(template=template):
    for old in (self.root/'content/articles').glob('*.md'):old.unlink()
    text=(repo/'templates'/template).read_text(encoding='utf-8-sig').replace('draft: true','draft: false')
    (self.root/'content/articles'/template).write_text(text,encoding='utf-8');items,_,assets=self.compile();self.assertEqual(len(items),1);self.assertEqual(items[0]['status'],'planned');self.assertFalse(assets)
 def test_build_fingerprints_media_and_publishes_only_referenced_assets(self):
  import shutil
  repo=Path(__file__).resolve().parents[1]
  for name in ['index.html','detail.html','app.js','core.mjs','style.css','favicon.svg']:shutil.copy2(repo/name,self.root/name)
  image=self.asset('image.png',b'first-version');self.asset('unreferenced.log')
  self.write({**self.meta,'cover':{'src':image,'alt':'test','kind':'illustration'}},body='## Image\n\n![image](../../assets/case/image.png)')
  lab.build(self.root)
  first=json.loads((self.root/'_site/generated/catalog.json').read_text(encoding='utf-8'))[0]
  self.asset('image.png',b'updated-version');lab.build(self.root)
  second=json.loads((self.root/'_site/generated/catalog.json').read_text(encoding='utf-8'))[0]
  self.assertNotEqual(first['cover']['src'],second['cover']['src'])
  self.assertNotEqual(first['articles']['zh'],second['articles']['zh'])
  self.assertTrue((self.root/'_site/assets/case/image.png').is_file())
  self.assertFalse((self.root/'_site/assets/case/unreferenced.log').exists())
  self.assertFalse((self.root/'_site/content').exists())
 def test_aligned_markdown_tables_are_supported(self):
  self.write(body='| Name | Value |\n| :--- | ---: |\n| test | 1 |')
  _,articles,_=self.compile();self.assertIn('align="right"',next(iter(articles.values()))['html'])
 def test_reserved_heading_ids_fail(self):
  self.write(body='# lab-scope')
  with self.assertRaisesRegex(lab.ContentError,'reserved'):self.compile()
 def test_published_content_compiles(self):
  items,articles,assets=lab.compile_content(Path(__file__).resolve().parents[1]);self.assertTrue(items);self.assertGreaterEqual(len(articles),len(items));self.assertEqual(len({x['id'] for x in items}),len(items))

if __name__=='__main__':unittest.main()
