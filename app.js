import { experiments, labels, facets, translate, selectItems, facetCount, setCatalog } from './core.mjs';
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
 if(item.cover) return `<figure class="visual real-cover ${large?'large':''}"><img src="${esc(item.cover.src)}" alt="${esc(item.cover.alt)}" loading="lazy"><figcaption class="illustration">${esc(item.cover.kind==='illustration'?t('示意图','Illustration'):item.cover.kind==='screenshot'?t('运行截图','Screenshot'):t('实拍图','Captured image'))}</figcaption></figure>`;
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
 return `<article class="experiment-card"><a class="card-link" href="detail.html?id=${encodeURIComponent(item.id)}">${picture(item)}<div class="card-body"><div class="card-topline"><span class="stage-label">${esc(label(item.stage))}</span><span class="status ${item.status}">${esc(label(item.status))}</span></div><h3>${esc(text(item.title))}</h3><p>${esc(text(item.description))}</p><div class="tags">${item.platforms.map(x=>`<span>${esc(x)}</span>`).join('')}${item.kind==='camera'&&item.connection!=='unknown'?`<span>${esc(label(item.connection))}</span>`:''}</div><div class="card-bottom"><span>${item.status==='verified'?t('查看验证记录','View validation'):t('查看实验计划','View experiment plan')}</span><span class="read-icon" aria-hidden="true">＋</span></div></div></a></article>`;
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
 document.querySelector('#result-count').textContent=t(`${results.length} 个案例 · ${results.filter(x=>x.status==='verified').length} 已验证`,`${results.length} cases · ${results.filter(x=>x.status==='verified').length} verified`);
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
 <div class="catalog-tabs"><a href="./#camera" ${camera?'aria-current="page"':''}>${t('相机接入','Cameras')}</a><a href="./#models" ${!camera?'aria-current="page"':''}>${t('模型实践','Models')}</a><span id="result-count" role="status" aria-live="polite"></span></div><div class="notice"><span class="notice-icon" aria-hidden="true">i</span><p>${t('计划与已验证案例分开展示；已验证记录包含作者提供的环境、证据与结论。','Plans are distinct from verified cases. Verified records include author-provided environments, evidence and conclusions.')}</p></div><div id="active-filters" class="active-filters"></div><div class="card-grid" id="result-grid"></div><div class="empty" id="empty" hidden><div class="empty-symbol" aria-hidden="true">⌕</div><h2>${t('没有匹配的实验','No matching experiments')}</h2><p>${t('试试减少筛选条件，或更换搜索关键词。','Try fewer filters or different search terms.')}</p><button type="button" class="button" data-reset>${t('清除筛选与搜索','Clear filters & search')}</button></div><p class="catalog-footnote">${t('无实拍封面的案例使用流程示意图，图中标注素材类型。','Cases without capture covers use workflow illustrations. Cover labels identify the media type.')}</p></section></div>`;
 document.querySelector('#filters').open = !window.matchMedia('(max-width: 760px)').matches;
 renderResults();
}
const articleCache = new Map();
let articleRequest=0;
const statusMessage=item=>item.status==='verified'?t('作者已在所列环境和范围内完成验证；结论及限制见下文。','The author has validated this case in the stated environment and scope; see conclusions and limitations below.'):t('本案例为实验计划，尚未完成验证。正文与素材不代表已完成适配或实测。','This is an experiment plan. Its text and media do not claim completed integration or measured results.');
function articleMedia(article){
 let html='';
 if(article.gallery?.length) html+=`<section id="lab-gallery"><h2>${t('实拍图与画质对比','Captures & image comparisons')}</h2><div class="media-gallery">${article.gallery.map(image=>`<figure><a href="${esc(image.src)}" target="_blank" rel="noopener"><img src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy"></a><figcaption><span class="media-type">${image.kind==='illustration'?t('示意图','Illustration'):image.kind==='screenshot'?t('截图','Screenshot'):t('实拍','Capture')}</span>${esc(image.caption)}</figcaption></figure>`).join('')}</div></section>`;
 if(article.videos?.length) html+=`<section id="lab-videos"><h2>${t('演示视频','Demo videos')}</h2>${article.videos.map(video=>`<figure class="video-block"><h3>${esc(video.title)}</h3>${video.src?`<video controls playsinline preload="metadata" ${video.poster?`poster="${esc(video.poster)}"`:''} aria-label="${esc(video.title)}"><source src="${esc(video.src)}" type="${video.src.split('?')[0].endsWith('.webm')?'video/webm':'video/mp4'}">${video.captions?`<track kind="captions" src="${esc(video.captions)}" srclang="${language}" label="${t('字幕','Captions')}">`:''}${t('浏览器不支持视频播放。','Your browser does not support video playback.')}</video><a class="media-download" href="${esc(video.src)}" download>${t('下载原视频','Download video')}</a>`:`<a class="outline-button" href="${esc(video.url)}" target="_blank" rel="noopener">${t('打开视频平台观看','Watch on video platform')}</a>`}<figcaption>${esc(video.caption)}</figcaption></figure>`).join('')}</section>`;
 if(article.performance){
  const perf=article.performance;
  html+=`<section id="lab-performance"><h2>${t('性能数据','Performance measurements')}</h2><p>${esc(perf.caption)}</p><div class="measurement-conditions"><h3>${t('测试条件与方法','Conditions & methodology')}</h3><dl>${Object.entries(perf.conditions).map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p>${esc(perf.methodology)}</p></div><div class="table-scroll" tabindex="0" role="region" aria-label="${t('性能数据表','Performance table')}"><table><caption class="sr-only">${esc(perf.caption)}</caption><thead><tr>${[t('配置','Variant'),t('指标','Metric'),t('测量值','Value'),t('单位','Unit'),t('样本数','Samples')].map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${perf.rows.map(row=>`<tr><th scope="row">${esc(row.variant)}</th><td>${esc(row.metric)}</td><td>${esc(row.value)}</td><td>${esc(row.unit)}</td><td>${esc(row.samples)}</td></tr>`).join('')}</tbody></table></div><a class="media-download" href="${esc(perf.csv)}" download>${t('下载原始 CSV','Download source CSV')}</a></section>`;
 }
 if(article.evidence?.length) html+=`<section id="lab-evidence"><h2>${t('代码与附件','Code & attachments')}</h2><ul>${article.evidence.map(link=>`<li><a href="${esc(link.url)}">${esc(link.title)}</a></li>`).join('')}</ul></section>`;
 return html;
}
async function fillArticle(item,request){
 const requestedLanguage=language;
 const articleLanguage=item.articles[requestedLanguage]?requestedLanguage:Object.keys(item.articles)[0];
 const url=item.articles[articleLanguage];
 try{
  let article=articleCache.get(url);
  if(!article){const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw new Error('Article request failed');article=await response.json();articleCache.set(url,article);}
  if(request!==articleRequest)return;
  const verification=article.verification;
  const fallback=articleLanguage!==requestedLanguage?`<p class="language-fallback">${t('暂无中文版本，以下显示英文原文。','No English edition is available; the original Chinese article is shown below.')}</p>`:'';
  const environment=Object.keys(article.environment??{}).length?`<section id="lab-environment"><h2>${t('验证环境','Environment')}</h2><dl class="facts">${Object.entries(article.environment).map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section>`:'';
  const summary=item.status==='verified'?`<section id="lab-verification"><h2>${t('验证结论','Validation summary')}</h2><dl class="verification-summary"><div><dt>${t('验证日期','Verified on')}</dt><dd>${esc(verification.date)}</dd></div><div><dt>${t('验证范围','Scope')}</dt><dd>${esc(verification.scope)}</dd></div><div><dt>${t('结论','Conclusion')}</dt><dd>${esc(verification.conclusion)}</dd></div><div><dt>${t('限制与未验证项','Limitations & untested areas')}</dt><dd>${esc(verification.limitations)}</dd></div></dl></section>`:'';
  document.querySelector('#article-content').innerHTML=fallback+summary+environment+`<div class="markdown-body" lang="${articleLanguage==='zh'?'zh-CN':'en'}">${article.html}</div>`+articleMedia(article);
  const links=[...(item.status==='verified'?[{id:'lab-verification',title:t('验证结论','Validation summary')}]:[]),...(environment?[{id:'lab-environment',title:t('验证环境','Environment')}]:[]),...article.toc,...(article.gallery?.length?[{id:'lab-gallery',title:t('实拍图与对比','Captures & comparisons')}]:[]),...(article.videos?.length?[{id:'lab-videos',title:t('演示视频','Demo videos')}]:[]),...(article.performance?[{id:'lab-performance',title:t('性能数据','Performance data')}]:[]),...(article.evidence?.length?[{id:'lab-evidence',title:t('代码与附件','Code & attachments')}]:[])];
  document.querySelector('#article-toc').innerHTML=links.map(x=>`<a href="#${esc(x.id)}">${esc(x.title)}</a>`).join('');
  if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));target?.scrollIntoView();}
 }catch(error){
  if(request!==articleRequest)return;
  document.querySelector('#article-content').innerHTML=`<section class="article-error" role="alert"><h2>${t('文章暂时无法加载','Unable to load the article')}</h2><p>${t('请检查网络后重试，或返回目录。','Check your connection and retry, or return to the catalog.')}</p><button class="button" type="button" data-retry-article>${t('重新加载','Retry')}</button></section>`;
 }
}
function renderDetail(){
 const request=++articleRequest;
 const item=experiments.find(x=>x.id===detailId);
 if(!item){current='camera';app.innerHTML=`<section class="empty"><h1>${t('未找到该实验','Experiment not found')}</h1><p>${t('链接可能有误，请返回目录选择实验。','This link may be invalid. Choose an experiment from the catalog.')}</p><a class="button" href="./#camera">${t('返回实验目录','Back to catalog')}</a></section>`;return;}
 current=item.kind;
 app.innerHTML=`<div class="detail-breadcrumb"><a href="${backLink(item)}">${item.kind==='camera'?t('相机接入','Cameras'):t('模型实践','Models')}</a><span>/</span><span>${esc(label(item.stage))}</span></div><section class="detail-heading"><div class="eyebrow">${item.status==='verified'?t('已验证 · 以文中环境和范围为准','VERIFIED · WITHIN THE DOCUMENTED SCOPE'):t('实验计划 · 尚未发布验证结果','EXPERIMENT PLAN · RESULTS PENDING')}</div><h1>${esc(text(item.title))}</h1><p>${esc(text(item.description))}</p><div class="tags">${item.platforms.map(p=>`<span>${esc(p)}</span>`).join('')}<span class="status ${item.status}">${esc(label(item.status))}</span></div></section><div class="detail-layout"><article class="article-body">${picture(item,true)}<div class="notice ${item.status==='verified'?'verified-notice':''}"><span class="notice-icon" aria-hidden="true">i</span><p>${statusMessage(item)}</p></div><section id="lab-scope"><h2>${t('实验范围','Experiment scope')}</h2><dl class="facts"><div><dt>${t('目标平台','Target platforms')}</dt><dd>${esc(item.platforms.join(' / '))}</dd></div><div><dt>${item.kind==='camera'?t('接入方式','Connection'):t('模型系列','Model family')}</dt><dd>${esc(label(item.kind==='models'?item.family:item.connection==='unknown'?t('接口未标注','Connection not specified'):item.connection))}</dd></div><div><dt>${item.kind==='camera'?'Sensor':t('任务类型','Task')}</dt><dd>${esc(label(item.kind==='camera'?item.sensor:item.task))}</dd></div><div><dt>${item.kind==='camera'?t('快门类型','Shutter type'):t('模型版本','Model version')}</dt><dd>${esc(label(item.kind==='camera'?item.shutter:item.model_version))}</dd></div></dl></section><div id="article-content" aria-live="polite"><p class="article-loading">${t('正在加载文章…','Loading article…')}</p></div>${item.related.length?`<section id="lab-related"><h2>${t('关联实验','Related experiments')}</h2><div class="related-links">${item.related.map(id=>{const related=experiments.find(x=>x.id===id);return `<a href="detail.html?id=${encodeURIComponent(id)}"><span>${esc(text(related.title))}</span><small>${esc(label(related.stage))}</small></a>`;}).join('')}</div></section>`:''}</article><aside class="toc"><span>${t('本页内容','On this page')}</span><a href="#lab-scope">${t('实验范围','Scope')}</a><div id="article-toc"></div>${item.related.length?`<a href="#lab-related">${t('关联实验','Related experiments')}</a>`:''}<a class="toc-back" href="${backLink(item)}">${t('返回目录','Back to catalog')}</a></aside></div>`;
 fillArticle(item,request);
}
function renderNotes(){
 app.innerHTML=`<section class="page-heading"><div class="eyebrow">FIELD NOTES</div><h1>${t('把调试过程，变成可复现的记录。','Make every experiment reproducible.')}</h1><p>${t('阅读 Markdown 实验文章，查看计划、验证证据与复现步骤。','Read Markdown experiment articles, plans, validation evidence and reproduction steps.')}</p><a class="outline-button" href="https://github.com/Dasoncai/dasoncai/blob/main/AUTHORING.md">${t('发布指南与案例模板','Publishing guide & templates')}</a></section><div class="notes-list">${experiments.map(item=>`<section class="note-row"><div><span class="stage-label">${esc(label(item.stage))} · ${esc(item.platforms.join(' / '))}</span><h2><a href="detail.html?id=${encodeURIComponent(item.id)}">${esc(text(item.title))}</a></h2><p>${esc(text(item.description))}</p></div><div><span class="status ${item.status}">${esc(label(item.status))}</span><a class="outline-button" href="detail.html?id=${encodeURIComponent(item.id)}">${t('阅读全文','Read article')}</a></div></section>`).join('')}</div>`;
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
 if(event.target.closest('[data-retry-article]')){renderDetail();return;}
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

async function start(){
 try{
  const response=await fetch('generated/catalog.json',{cache:'no-cache'});
  if(!response.ok)throw new Error('Catalog request failed');
  setCatalog(await response.json());route();
 }catch(error){
  app.innerHTML=`<section class="empty" role="alert"><h1>${t('目录暂时无法加载','Unable to load the catalog')}</h1><p>${t('请检查网络后刷新页面。','Check your connection and reload this page.')}</p><button type="button" class="button" data-retry-catalog>${t('重试','Retry')}</button></section>`;
  renderHeader();
 }
}
document.addEventListener('click',event=>{if(event.target.closest('[data-retry-catalog]'))start();});
start();
