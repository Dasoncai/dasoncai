export const pair = (zh, en) => ({zh, en});
export const labels = {
 platform: pair('硬件平台', 'Hardware platform'), sensor: pair('Sensor 型号', 'Sensor model'), shutter: pair('快门类型', 'Shutter type'), connection: pair('接入方式', 'Connection'), stage: pair('实践环节', 'Workflow stage'), task: pair('任务类型', 'Task'), family: pair('模型系列', 'Model family'),
 unknown: pair('待确认', 'To be confirmed'), planned: pair('实验计划', 'Planned'), verified: pair('已验证', 'Verified'), status: pair('验证状态', 'Validation status'), rolling: pair('卷帘快门', 'Rolling shutter'), global: pair('全局快门', 'Global shutter'), capture: pair('接入与点亮', 'Camera bring-up'), isp: pair('图像调试与 ISP', 'Image debugging & ISP'), train: pair('模型训练', 'Model training'), deploy: pair('端侧推理', 'Edge inference'), optimize: pair('性能优化', 'Performance tuning'), detection: pair('目标检测', 'Object detection')
};
export const translate = (value, language = 'zh') => typeof value === 'object' && value !== null ? (value[language] ?? value.zh ?? value.en ?? '') : String(value ?? '');
export const experiments = [];
export const facets = {
 camera: [ ['platform',['RDK X5','RDK S100']], ['sensor',['unknown']], ['shutter',['rolling','global','unknown']], ['connection',['Direct MIPI','USB','SerDes','Internet Protocol Camera']], ['stage',['capture','isp']], ['status',['planned','verified']] ],
 models: [ ['platform',['RDK X5','RDK S100']], ['task',['detection']], ['family',['YOLO']], ['stage',['train','deploy','optimize']], ['status',['planned','verified']] ]
};
export function matches(item, {kind='camera', query='', filters={}} = {}, ignore='') {
 if(item.kind !== kind) return false;
 const text=[item.title.zh,item.title.en,item.description.zh,item.description.en,...item.platforms,item.sensor,item.connection,item.family,item.stage,translate(labels[item.stage],'zh'),translate(labels[item.stage],'en'),item.status,translate(labels[item.status],'zh'),translate(labels[item.status],'en')].join(' ').toLowerCase();
 if(query.trim() && !query.trim().toLowerCase().split(/\s+/).every(word=>text.includes(word))) return false;
 return Object.entries(filters).every(([key,values]) => key===ignore || !values.length || (key==='platform' ? item.platforms.some(v=>values.includes(v)) : values.includes(item[key])));
}
export function selectItems(items, state) {
 const result=items.filter(item=>matches(item,state));
 if(state.sort==='title') result.sort((a,b)=>translate(a.title,state.language).localeCompare(translate(b.title,state.language),state.language==='zh'?'zh-CN':'en'));
 return result;
}
export function facetCount(items,state,key,value){
 return items.filter(item=>matches(item,state,key) && (key==='platform'?item.platforms.includes(value):item[key]===value)).length;
}

export function setCatalog(items) {
 if (!Array.isArray(items) || !items.every(item => item.id && item.title && item.articles && ['camera','models'].includes(item.kind))) throw new Error('Invalid catalog');
 experiments.splice(0,experiments.length,...items);
 for(const kind of ['camera','models']) {
  for(const [key,options] of facets[kind]) {
   if(['sensor','family','task'].includes(key)) {
    const values=[...new Set(items.filter(item=>item.kind===kind).map(item=>item[key]).filter(Boolean))];
    options.splice(0,options.length,...(values.length?values:['unknown']));
   }
  }
 }
}
