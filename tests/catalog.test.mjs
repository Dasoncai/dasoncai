import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const source=fs.readFileSync(new URL('core.mjs',root),'utf8');
const {setCatalog,experiments,selectItems,facetCount,facets,translate}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const published=JSON.parse(fs.readFileSync(new URL('_site/generated/catalog.json',root),'utf8'));
assert.ok(Array.isArray(published) && published.length>0);
const make=(id,kind,platforms,connection,stage)=>({id,kind,platforms,connection,stage,sensor:'unknown',shutter:'unknown',status:'planned',family:'YOLO',task:'detection',title:{zh:id,en:id},description:{zh:'',en:''},articles:{zh:'fixture.json'}});
const items=[
 make('x5-mipi','camera',['RDK X5'],'Direct MIPI','capture'),
 make('s100-mipi','camera',['RDK S100'],'Direct MIPI','capture'),
 make('usb','camera',['RDK X5','RDK S100'],'USB','capture'),
 make('isp','camera',['RDK X5','RDK S100'],'unknown','isp'),
 ...['a','b','c','d'].map(id=>make(id,'models',['RDK X5'],'unknown','deploy'))
];
setCatalog(items);
const state={kind:'camera',query:'',filters:{},sort:'default',language:'zh'};
assert.equal(selectItems(experiments,state).length,4);
assert.equal(selectItems(experiments,{...state,kind:'models'}).length,4);
assert.equal(selectItems(experiments,{...state,filters:{platform:['RDK X5'],connection:['Direct MIPI']}})[0].id,'x5-mipi');
assert.equal(selectItems(experiments,{...state,filters:{platform:['RDK X5','RDK S100'],connection:['Direct MIPI']}}).length,2);
assert.equal(selectItems(experiments,{...state,query:'RDK S100 MIPI'}).map(x=>x.id).join(),'s100-mipi');
assert.equal(selectItems(experiments,{...state,filters:{status:['verified']}}).length,0);
assert.equal(selectItems(experiments,{...state,filters:{status:['planned']}}).length,4);
assert.equal(facetCount(experiments,{...state,filters:{connection:['Direct MIPI']}},'platform','RDK S100'),1);
const fixture={...items[0],id:'test-case',sensor:'TEST-SENSOR',status:'verified',connection:'Internet Protocol Camera',title:{zh:'测试'},articles:{zh:'fixture.json'}};
setCatalog([...items,fixture]);
assert.ok(facets.camera.find(([key])=>key==='sensor')[1].includes('TEST-SENSOR'));
assert.ok(facets.camera.find(([key])=>key==='connection')[1].includes('Internet Protocol Camera'));
assert.ok(!facets.camera.find(([key])=>key==='connection')[1].includes('unknown'));
assert.equal(selectItems(experiments,{...state,filters:{status:['verified']}})[0].id,'test-case');
assert.equal(translate(fixture.title,'en'),'测试');
assert.equal(selectItems(experiments,{...state,query:'TEST-SENSOR'}).length,1);
console.log('PASS: catalog filters, statuses, dynamic sensors, IP camera category, bilingual fallback and search');
