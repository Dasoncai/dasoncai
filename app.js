import { experiments, labels, facets, translate, selectItems, facetCount, outlines } from './core.mjs';
const app = document.querySelector('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let language='zh';
try { language=localStorage.getItem('language')==='en'?'en':'zh'; } catch {}
const t = (zh,en) => language==='zh'?zh:en;
const text = value => translate(value,language);
const label = value => text(labels[value] ?? value);
let state = {kind:'camera',query:'',filters:{},sort:'default',language};
let current='camera';
const detailId = new URL(location.href).searchParams.get('id');
const isDetail = location.pathname.endsWith('/detail.html');
const backLink = item => `./#${item?.kind ?? 'camera'}`;
function picture(item,large=false){
 const tone=item.kind==='camera'?'blue':'purple';
 const lens='<rect x="86" y="38" width="148" height="102" rx="15" fill="white" stroke="#a1b5cc" stroke-width="2"/><rect x="100" y="23" width="40" height="15" rx="4" fill="#a1b5cc"/><circle cx="160" cy="89" r="35" fill="#e3effb" stroke="#7e9fbe" stroke-width="2"/><circle cx="160" cy="89" r="23" fill="#143c62"/><circle cx="160" cy="89" r="11" fill="#4b8bc1"/><circle cx="153" cy="82" r="4" fill="#d8eeff"/><circle cx="217" cy="54" r="4" fill="#81aece"/>';
 const network='<path d="M82 45L157 24 236 61 213 132 133 151 82 45 213 132 157 24 133 151 236 61 82 45" fill="none" stroke="#b6a7d8" stroke-width="2"/>'+[[82,45],[157,24],[236,61],[213,132],[133,151]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i===1?12:9}" fill="${i===1?'#7f65b8':'#e0d7f1'}" stroke="#8e77b6" stroke-width="2"/>`).join('');
 const isp='<rect x="68" y="29" width="184" height="120" rx="8" fill="white" stroke="#a9b7c6" stroke-width="2"/><path d="M78 133L120 81 154 113 192 59 242 133Z" fill="#bdc9d7"/><path d="M160 114L192 59 242 133H160Z" fill="#73b2b3"/><circle cx="113" cy="59" r="13" fill="#e4cb91"/><path d="M160 26V152" stroke="#0071e3" stroke-width="2"/><circle cx="160" cy="89" r="12" fill="white" stroke="#0071e3" stroke-width="2"/><path d="M155 89H165" stroke="#0071e3" stroke-width="2"/>';
 const detect='<rect x="63" y="25" width="194" height="126" rx="9" fill="white" stroke="#baaed0" stroke-width="2"/><path d="M74 132L117 83 149 114 192 58 246 132Z" fill="#e0d9ec"/><rect x="158" y="44" width="57" height="76" rx="2" fill="none" stroke="#8a64c6" stroke-width="2"/><rect x="86" y="75" width="53" height="56" rx="2" fill="none" stroke="#6a9eac" stroke-width="2"/><path d="M158 44V36H187M86 75V67H115" fill="none" stroke="#8a64c6" stroke-width="3"/>';
 const perf='<rect x="65" y="25" width="190" height="128" rx="9" fill="white" stroke="#b5a8ce" stroke-width="2"/><path d="M85 45V133H238M85 105H237M85 77H237" fill="none" stroke="#e6e0ef" stroke-width="2"/><rect x="108" y="88" width="22" height="44" rx="4" fill="#cfbee9"/><rect x="153" y="67" width="22" height="65" rx="4" fill="#a991d0"/><rect x="198" y="47" width="22" height="85" rx="4" fill="#7e60b1"/>';
 const art=item.art==='isp'?isp:item.art==='training'?network:item.art==='inference'?detect:item.art==='performance'?perf:lens;
 return `<div class="visual ${tone} ${large?'large':''}"><div class="visual-grid"></div><span class="visual-label">${esc(item.art==='isp'?'IMAGE QUALITY':item.kind==='camera'?'CAMERA PIPELINE':item.art==='training'?'TRAINING WORKFLOW':item.art==='performance'?'PERFORMANCE STUDY':'EDGE INFERENCE')}</span><svg viewBox="0 0 320 178" aria-hidden="true" focusable="false">${art}</svg><span class="illustration">${t('示意图 · 非实拍','Illustration · not a capture')}</span></div>`;
}
function card(item){
 return `<article class="experiment-card"><a class="card-link" href="detail.html?id=${encodeURIComponent(item.id)}">${picture(item)}<div class="card-body"><div class="card-topline"><span class="stage-label">${esc(label(item.stage))}</span><span class="status">${esc(label(item.status))}</span></div><h3>${esc(text(item.title))}</h3><p>${esc(text(item.description))}</p><div class="tags">${item.platforms.map(x=>`<span>${esc(x)}</span>`).join('')}${item.kind==='camera'?`<span>${esc(label(item.connection))}</span>`:''}</div><div class="card-bottom"><span>${t('查看实验计划','View experiment plan')}</span><span class="read-icon" aria-hidden="true">＋</span></div></div></a></article>`;
}
function renderHeader(){
 document.documentElement.lang=language==='zh'?'zh-CN':'en';
 document.querySelectorAll('[data-zh]').forEach(el=>el.textContent=language==='zh'?el.dataset.zh:el.dataset.en);
 document.querySelector('[data-nav]').setAttribute('aria-label',t('主导航','Main navigation'));
 document.querySelectorAll('[data-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.language===language)));
 document.querySelectorAll('[data-view]').forEach(el=>{if(el.dataset.view===current)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
 document.querySelector('#year').textContent=new Date().getFullYear();
 document.title=`${isDetail ? text(experiments.find(x=>x.id===detailId)?.title) || t('未找到实验','Experiment not found') : ({camera:t('相机接入','Camera integration'),models:t('模型实践','Model practice'),notes:t('实验笔记','Field notes'),about:t('关于','About')})[current]} · RDK Vision Lab`;
 document.querySelector('meta[name="description"]').content=t('RDK X5 与 RDK S100 相机接入、影像调试、ISP 调优、模型训练、端侧推理与性能优化实践。','Camera bring-up, ISP tuning, model training, edge inference and performance experiments on RDK X5 and RDK S100.');
}
function getStateFromUrl(){
 const params=new URL(location.href).searchParams;
 state.query=params.get('q')??'';state.sort=params.get('sort')==='title'?'title':'default';state.filters={};
 for(const [key,options] of facets[state.kind]){const v=params.getAll(key).filter(x=>options.includes(x));if(v.length)state.filters[key]=[...new Set(v)];}
}
function saveUrl(){
 const url=new URL(location.href);url.search='';if(state.query)url.searchParams.set('q',state.query);if(state.sort!=='default')url.searchParams.set('sort',state.sort);
 for(const [key,values] of Object.entries(state.filters)) values.forEach(v=>url.searchParams.append(key,v));
 url.hash=current;history.replaceState(null,'',url);
}
function renderFacets(){
 const group=document.querySelector('#facet-fields');
 group.innerHTML=facets[state.kind].map(([key,options])=>`<fieldset><legend>${esc(label(key))}</legend>${options.map(value=>{const count=facetCount(experiments,state,key,value);const checked=(state.filters[key]??[]).includes(value);return `<label class="filter-option ${count?'':'zero'}"><input type="checkbox" data-facet="${key}" value="${esc(value)}" ${checked?'checked':''}><span>${esc(label(value))}</span><span class="facet-count">${count}</span></label>`;}).join('')}</fieldset>`).join('');
 const count=Object.values(state.filters).flat().length;
 document.querySelector('#filter-toggle-label').textContent=t('筛选条件','Filters')+(count?` (${count})`:'');
}
function renderResults(){
 const results=selectItems(experiments,{...state,language});
 document.querySelector('#result-count').textContent=t(`${results.length} 个实验计划`,`${results.length} experiment plans`);
 document.querySelector('#result-grid').innerHTML=results.map(card).join('');
 document.querySelector('#empty').hidden=!!results.length;
 document.querySelector('#active-filters').innerHTML=Object.entries(state.filters).flatMap(([key,values])=>values.map(value=>`<button class="filter-chip" type="button" data-remove-key="${key}" data-remove-value="${esc(value)}" aria-label="${esc(t('移除','Remove')+' '+label(value))}">${esc(label(value))}<span aria-hidden="true">×</span></button>`)).join('');
 renderFacets();
}
function renderCatalog(){
 const camera=current==='camera';
 app.innerHTML=`<section class="page-heading"><div class="eyebrow">RDK VISION LAB <span>/</span> ${camera?'CAMERA INTEGRATION':'MODEL ENGINEERING'}</div><div class="heading-line"><div><h1>${camera?t('让相机点亮，让影像可见。','Bring cameras to life.'):t('从模型训练，到端侧运行。','From training to the edge.')}</h1><p>${camera?t('RDK X5 / S100 上的相机接入、影像调试与 ISP 实验。','Camera integration, image debugging and ISP experiments on RDK X5 / S100.'):t('记录训练、部署、推理与性能优化，建立可复现的模型实践。','Reproducible experiments in model training, deployment, inference and performance.')}</p></div><span class="platform-pill">RDK X5 <span>·</span> RDK S100</span></div></section>
 <div class="catalog-layout"><aside class="sidebar"><details id="filters" open><summary><span id="filter-toggle-label">${t('筛选条件','Filters')}</span><span class="chevron" aria-hidden="true"></span></summary><div class="filter-content"><div class="sidebar-top"><span>${t('组合筛选','Refine results')}</span><button type="button" class="text-button" data-reset>${t('重置','Reset')}</button></div><div id="facet-fields"></div><p class="sidebar-note">${camera?t('Sensor 与快门信息确认后更新。选择“待确认”可查看未标注计划。','Sensor and shutter tags will be updated after confirmation. Use “To be confirmed” for untagged plans.'):t('训练项目的平台标签表示目标部署平台。','Platform tags on training plans indicate deployment targets.')}</p></div></details></aside>
 <section class="catalog-content" aria-label="${t('实验目录','Experiment catalog')}"><div class="toolbar"><label class="search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16L21 21"/></svg><input id="search" type="search" maxlength="200" value="${esc(state.query)}" placeholder="${camera?t('搜索平台、接口、实验关键词…','Search platforms, interfaces, experiments…'):t('搜索模型、平台、训练与优化…','Search models, platforms, training…')}" aria-label="${t('搜索实验','Search experiments')}"></label><label class="sort"><span class="sr-only">${t('排序','Sort')}</span><select id="sort"><option value="default">${t('默认顺序','Default order')}</option><option value="title" ${state.sort==='title'?'selected':''}>${t('按标题排序','Title A–Z')}</option></select></label></div>
 <div class="catalog-tabs"><a href="./#camera" ${camera?'aria-current="page"':''}>${t('相机接入','Cameras')}</a><a href="./#models" ${!camera?'aria-current="page"':''}>${t('模型实践','Models')}</a><span id="result-count" role="status" aria-live="polite"></span></div><div class="notice"><span class="notice-icon" aria-hidden="true">i</span><p>${t('当前为实验计划目录；实拍图、运行日志与性能数据将在完成验证后补充。','These are experiment plans. Captures, logs and performance data will be added after validation.')}</p></div><div id="active-filters" class="active-filters"></div><div class="card-grid" id="result-grid"></div><div class="empty" id="empty" hidden><div class="empty-symbol" aria-hidden="true">⌕</div><h2>${t('没有匹配的实验','No matching experiments')}</h2><p>${t('试试减少筛选条件，或更换搜索关键词。','Try fewer filters or different search terms.')}</p><button type="button" class="button" data-reset>${t('清除筛选与搜索','Clear filters & search')}</button></div><p class="catalog-footnote">${t('所有卡片封面均为流程示意，未作为实验结果。','All card covers are workflow illustrations, not experimental results.')}</p></section></div>`;
 document.querySelector('#filters').open = !window.matchMedia('(max-width: 760px)').matches;
 renderResults();
}
function renderDetail(){
 const item=experiments.find(x=>x.id===detailId);
 if(!item){current='camera';app.innerHTML=`<section class="empty"><h1>${t('未找到该实验','Experiment not found')}</h1><p>${t('链接可能有误，请返回目录选择实验。','This link may be invalid. Choose an experiment from the catalog.')}</p><a class="button" href="./#camera">${t('返回实验目录','Back to catalog')}</a></section>`;return;}
 current=item.kind;
 const sections=outlines[item.stage];
 app.innerHTML=`<div class="detail-breadcrumb"><a href="${backLink(item)}">${item.kind==='camera'?t('相机接入','Cameras'):t('模型实践','Models')}</a><span>/</span><span>${esc(label(item.stage))}</span></div><section class="detail-heading"><div class="eyebrow">${t('实验计划 · 尚未发布验证结果','EXPERIMENT PLAN · RESULTS PENDING')}</div><h1>${esc(text(item.title))}</h1><p>${esc(text(item.description))}</p><div class="tags">${item.platforms.map(p=>`<span>${p}</span>`).join('')}<span>${esc(label(item.status))}</span></div></section><div class="detail-layout"><article class="article-body">${picture(item,true)}<div class="notice"><span class="notice-icon" aria-hidden="true">i</span><p>${t('本页是待执行的实验记录框架，不代表已完成适配或实测。具体型号、环境、图像和数据将在验证后填写。','This is a planned experiment outline, not a claim of completed integration or measured results. Hardware, environments, images and data will be filled in after validation.')}</p></div><section id="scope"><h2>${t('实验范围','Experiment scope')}</h2><dl class="facts"><div><dt>${t('目标平台','Target platforms')}</dt><dd>${item.platforms.join(' / ')}</dd></div><div><dt>${item.kind==='camera'?t('接入方式','Connection'):t('模型系列','Model family')}</dt><dd>${esc(label(item.connection??item.family))}</dd></div><div><dt>${item.kind==='camera'?'Sensor':t('任务类型','Task')}</dt><dd>${esc(label(item.kind==='camera'?item.sensor:item.task))}</dd></div><div><dt>${item.kind==='camera'?t('快门类型','Shutter type'):t('模型版本','Model version')}</dt><dd>${esc(label(item.kind==='camera'?item.shutter:'unknown'))}</dd></div></dl></section>${sections.map(([heading,body],index)=>`<section id="step-${index}"><h2>${esc(text(heading))}</h2><p>${esc(text(body))}</p></section>`).join('')}<section id="evidence"><h2>${t('成果与附件','Results & attachments')}</h2><div class="evidence-box"><span class="status">${t('待验证','Pending validation')}</span><p>${t('实拍图、演示视频、运行日志、配置文件与代码版本待补充。','Captured images, demo videos, logs, configuration files and code revisions are pending.')}</p></div></section><section id="related"><h2>${t('关联实验','Related experiments')}</h2><div class="related-links">${item.related.map(id=>{const related=experiments.find(x=>x.id===id);return `<a href="detail.html?id=${id}"><span>${esc(text(related.title))}</span><small>${esc(label(related.stage))}</small></a>`;}).join('')}</div></section></article><aside class="toc"><span>${t('本页内容','On this page')}</span><a href="#scope">${t('实验范围','Scope')}</a>${sections.map(([heading],index)=>`<a href="#step-${index}">${esc(text(heading))}</a>`).join('')}<a href="#evidence">${t('成果与附件','Results & attachments')}</a><a href="#related">${t('关联实验','Related experiments')}</a><a class="toc-back" href="${backLink(item)}">${t('返回目录','Back to catalog')}</a></aside></div>`;
}
function renderNotes(){
 const groups=[['capture',t('相机接入与排查','Camera bring-up & debugging'),t('记录连接、版本、采集步骤和故障定位，让点亮过程可以重现。','Connections, versions, capture procedures and troubleshooting for reproducible bring-up.')],['isp',t('ISP 调优记录','ISP tuning notes'),t('固定测试场景，保留参数变化、原图和前后效果对比。','Controlled scenes, parameter changes, original images and before/after comparisons.')],['train',t('训练与评估记录','Training & evaluation'),t('建立数据集、训练配置、评估指标和模型版本的对应关系。','Link datasets, training configurations, evaluation metrics and model revisions.')],['optimize',t('性能分析记录','Performance investigations'),t('区分推理耗时、端到端延迟和吞吐率，保留优化前后的测试条件。','Separate inference time, end-to-end latency and throughput with documented benchmark conditions.')]];
 app.innerHTML=`<section class="page-heading"><div class="eyebrow">FIELD NOTES</div><h1>${t('把调试过程，变成可复现的记录。','Make every experiment reproducible.')}</h1><p>${t('技术文章尚在准备中。先查看各专题的记录框架与待验证内容。','Technical articles are being prepared. Explore the topic outlines and planned validation work.')}</p></section><div class="notes-list">${groups.map(([stage,title,body])=>`<section class="note-row"><div><span class="stage-label">${esc(label(stage))}</span><h2>${title}</h2><p>${body}</p></div><div><span class="status">${t('文章待发布','Articles pending')}</span><a class="outline-button" href="./?stage=${stage}#${['train','optimize'].includes(stage)?'models':'camera'}">${t('查看相关计划','View related plans')}</a></div></section>`).join('')}</div>`;
}
function renderAbout(){app.innerHTML=`<section class="about-hero"><div class="eyebrow">ABOUT THE LAB</div><h1>${t('相机与模型之间，<br>是一次次真实的开发验证。','Between cameras and models,<br>there is engineering.')}</h1><p>${t('我是 Dasoncai。这里专注于 RDK X5 与 RDK S100 上的相机接入、点亮与调试，以及模型训练、端侧推理和性能优化。','I’m Dasoncai. This lab focuses on camera integration, bring-up and debugging, model training, edge inference and performance optimization for RDK X5 and RDK S100.')}</p></section><div class="about-grid"><section><h2>${t('围绕完整链路记录','Documenting the whole pipeline')}</h2><p>${t('从硬件连接到图像采集，从 ISP 调优到模型检测，再到训练与性能优化。相机与模型实验互相关联，记录每一步的条件、过程与结论。','From hardware connections and image capture to ISP tuning, model detection, training and performance. Camera and model experiments connect through documented conditions, processes and conclusions.')}</p></section><section><h2>${t('用证据呈现成果','Evidence before claims')}</h2><p>${t('计划与验证结果分开展示。每项成果附环境版本、复现步骤、图像或日志；性能数据注明测量范围与配置。','Plans are distinguished from verified results. Published results include environment versions, reproduction steps, images or logs, with measurement scope and configuration for benchmarks.')}</p></section></div><section class="contact-panel"><div><div class="eyebrow">GET IN TOUCH</div><h2>${t('交流相机与端侧 AI 实践。','Let’s talk cameras and edge AI.')}</h2><a class="email-link" href="mailto:dasoncc2000@gmail.com">dasoncc2000@gmail.com</a></div><a class="button" href="https://github.com/Dasoncai">GitHub / Dasoncai</a></section><p class="independent">${t('个人开发记录站点，非 RDK 官方文档或产品支持承诺。','An independent personal development log, not official RDK documentation or a product support commitment.')}</p>`;}
function render(){
 if(isDetail)renderDetail();else if(current==='notes')renderNotes();else if(current==='about')renderAbout();else renderCatalog();
 renderHeader();
}
function route(){
 if(isDetail){render();return;}
 const view=location.hash.slice(1);
 current=['camera','models','notes','about'].includes(view)?view:'camera';
 if(current==='camera'||current==='models'){state.kind=current;getStateFromUrl();}
 render();
}
document.addEventListener('click',event=>{
 if(event.target.closest('.skip')){event.preventDefault();document.querySelector('#main').focus();return;}
 const languageButton=event.target.closest('[data-language]');
 if(languageButton){language=languageButton.dataset.language;try{localStorage.setItem('language',language);}catch{}render();return;}
 if(event.target.closest('[data-reset]')){state.query='';state.filters={};state.sort='default';saveUrl();renderCatalog();return;}
 const remove=event.target.closest('[data-remove-key]');
 if(remove){state.filters[remove.dataset.removeKey]=state.filters[remove.dataset.removeKey].filter(x=>x!==remove.dataset.removeValue);saveUrl();renderResults();document.querySelector('#search').focus();}
});
app.addEventListener('input',event=>{if(event.target.id==='search'){state.query=event.target.value;saveUrl();renderResults();}});
app.addEventListener('change',event=>{
 if(event.target.dataset.facet){const key=event.target.dataset.facet;const current=new Set(state.filters[key]??[]);event.target.checked?current.add(event.target.value):current.delete(event.target.value);state.filters[key]=[...current];saveUrl();renderResults();const option=[...document.querySelectorAll('[data-facet]')].find(el=>el.dataset.facet===key&&el.value===event.target.value);option?.focus();}
 else if(event.target.id==='sort'){state.sort=event.target.value;saveUrl();renderResults();}
});
window.addEventListener('hashchange',()=>{if(!isDetail){route();window.scrollTo({top:0});}});
window.addEventListener('popstate',()=>{if(!isDetail)route();});
route();
