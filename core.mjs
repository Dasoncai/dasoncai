export const pair = (zh, en) => ({zh, en});
export const labels = {
 platform: pair('硬件平台', 'Hardware platform'), sensor: pair('Sensor 型号', 'Sensor model'), shutter: pair('快门类型', 'Shutter type'), connection: pair('接入方式', 'Connection'), stage: pair('实践环节', 'Workflow stage'), task: pair('任务类型', 'Task'), family: pair('模型系列', 'Model family'),
 unknown: pair('待确认', 'To be confirmed'), planned: pair('实验计划', 'Planned'), rolling: pair('卷帘快门', 'Rolling shutter'), global: pair('全局快门', 'Global shutter'), capture: pair('接入与点亮', 'Camera bring-up'), isp: pair('图像调试与 ISP', 'Image debugging & ISP'), train: pair('模型训练', 'Model training'), deploy: pair('端侧推理', 'Edge inference'), optimize: pair('性能优化', 'Performance tuning'), detection: pair('目标检测', 'Object detection')
};
export const translate = (value, language = 'zh') => typeof value === 'object' && value !== null ? (value[language] ?? value.zh ?? '') : String(value ?? '');
const entry = (id, kind, platforms, title, description, fields, related) => ({id, kind, platforms, title, description, status:'planned', sensor:'unknown', shutter:'unknown', ...fields, related});
export const experiments = [
 entry('x5-mipi','camera',['RDK X5'],pair('RDK X5 · MIPI 相机接入','RDK X5 · MIPI camera bring-up'),pair('从连接检查到图像采集，整理点亮过程与问题排查。','Trace the path from connection checks to image capture and troubleshooting.'),{connection:'Direct MIPI',stage:'capture',art:'camera'},['x5-yolo','isp-workflow']),
 entry('s100-mipi','camera',['RDK S100'],pair('RDK S100 · MIPI 相机接入','RDK S100 · MIPI camera bring-up'),pair('独立记录 S100 的环境与接入配置，建立可复现的验证流程。','Document S100-specific environments and camera configuration for repeatable validation.'),{connection:'Direct MIPI',stage:'capture',art:'camera'},['s100-yolo','isp-workflow']),
 entry('usb-capture','camera',['RDK X5','RDK S100'],pair('USB 相机 · 采集链路验证','USB camera · Capture validation'),pair('计划检查设备枚举、输出格式、采集稳定性与模型输入衔接。','Plan device enumeration, format checks, capture stability and model input integration.'),{connection:'USB',stage:'capture',art:'usb'},['performance']),
 entry('isp-workflow','camera',['RDK X5','RDK S100'],pair('ISP · 画质调试与场景对比','ISP · Image quality investigation'),pair('计划在固定场景下记录曝光、白平衡、色彩与噪声的调优对比。','Plan controlled-scene comparisons of exposure, white balance, color and noise.'),{connection:'unknown',stage:'isp',art:'isp'},['x5-mipi','s100-mipi']),
 entry('yolo-training','models',['RDK X5','RDK S100'],pair('YOLO · 数据集与模型训练','YOLO · Dataset & model training'),pair('训练侧记录数据划分、标注、配置和评估，平台标签表示目标部署平台。','Record dataset splits, labels, training configuration and evaluation. Platform labels indicate deployment targets.'),{family:'YOLO',task:'detection',stage:'train',art:'training'},['x5-yolo','s100-yolo']),
 entry('x5-yolo','models',['RDK X5'],pair('RDK X5 · YOLO 端侧推理','RDK X5 · On-device YOLO inference'),pair('计划贯通模型转换、输入处理、推理输出与检测结果展示。','Plan conversion, input processing, inference outputs and detection visualization.'),{family:'YOLO',task:'detection',stage:'deploy',art:'inference'},['x5-mipi','yolo-training','performance']),
 entry('s100-yolo','models',['RDK S100'],pair('RDK S100 · YOLO 端侧推理','RDK S100 · On-device YOLO inference'),pair('独立记录 S100 的部署环境、模型产物和端到端运行过程。','Record S100 deployment environments, model artifacts and end-to-end execution separately.'),{family:'YOLO',task:'detection',stage:'deploy',art:'inference'},['s100-mipi','yolo-training','performance']),
 entry('performance','models',['RDK X5','RDK S100'],pair('性能优化 · 从耗时到吞吐','Performance · Latency & throughput'),pair('计划拆解采集、预处理、推理与后处理，记录优化前后的测试条件。','Plan to profile capture, preprocessing, inference and postprocessing under documented test conditions.'),{family:'YOLO',task:'detection',stage:'optimize',art:'performance'},['x5-yolo','s100-yolo'])
];
export const facets = {
 camera: [ ['platform',['RDK X5','RDK S100']], ['sensor',['unknown']], ['shutter',['rolling','global','unknown']], ['connection',['Direct MIPI','USB','SerDes','unknown']], ['stage',['capture','isp']] ],
 models: [ ['platform',['RDK X5','RDK S100']], ['task',['detection']], ['family',['YOLO']], ['stage',['train','deploy','optimize']] ]
};
export function matches(item, {kind='camera', query='', filters={}} = {}, ignore='') {
 if(item.kind !== kind) return false;
 const text=[item.title.zh,item.title.en,item.description.zh,item.description.en,...item.platforms,item.sensor,item.connection,item.family,item.stage,translate(labels[item.stage],'zh'),translate(labels[item.stage],'en')].join(' ').toLowerCase();
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
export const outlines = {
 capture: [
 [pair('硬件与连接','Hardware & connections'),pair('待记录 Sensor 与模组型号、接口、线缆、供电和连接照片。型号与快门类型确认后再更新筛选标签。','Record the sensor and module, interface, cables, power and connection photos. Update sensor and shutter tags only after confirmation.')],
 [pair('平台与环境','Platform & environment'),pair('分别记录开发板型号、系统镜像、SDK、内核及相机配置版本，避免将另一平台的配置直接作为验证结果。','Record board, OS image, SDK, kernel and camera configuration revisions separately for each platform.')],
 [pair('点亮与采集验证','Bring-up & capture checks'),pair('待补充设备识别、配置过程、采集命令和日志，使用原始帧与实际图像确认采集结果。','Add device identification, configuration, capture commands and logs, supported by raw frames and captured images.')],
 [pair('调试记录与复现','Debugging & reproduction'),pair('按现象、排查步骤、根因和解决方法记录问题；附源码提交、配置文件、分辨率与实测采集帧率。','Document symptoms, investigation, root cause and fixes. Attach code revisions, configuration, resolution and measured capture frame rate.')]
 ],
 isp: [
 [pair('固定测试条件','Controlled test conditions'),pair('待确认 Sensor、镜头、固件与 ISP 版本，记录照明、色温、距离及曝光设置，保持对比条件一致。','Confirm sensor, lens, firmware and ISP revisions; record lighting, color temperature, distance and exposure for consistent comparisons.')],
 [pair('调优前后对比','Before & after'),pair('待上传同场景的原始素材与处理结果，逐项记录曝光、白平衡、色彩、降噪和锐化参数的变化。','Upload original and processed images of the same scene, with changes in exposure, white balance, color, denoising and sharpening.')],
 [pair('分析与结论','Analysis & conclusions'),pair('待结合亮暗部、色彩、噪声和细节说明效果及取舍，附可复现配置，不用示意图作为实拍证据。','Assess highlights, shadows, color, noise and detail, including tradeoffs and reproducible settings. Illustrations are not capture evidence.')]
 ],
 train: [
 [pair('数据与标注','Dataset & annotation'),pair('待记录数据来源、使用许可、类别、标注规则和训练/验证/测试集划分，避免数据泄漏。','Record sources, usage permissions, classes, labeling rules and train/validation/test splits to prevent leakage.')],
 [pair('训练环境与配置','Training environment & configuration'),pair('待记录训练主机、GPU、框架、模型版本、输入尺寸、超参数和权重。RDK 标签仅表示目标部署平台。','Record host, GPU, framework, model version, input size, hyperparameters and weights. RDK labels identify target deployment platforms.')],
 [pair('评估与部署交接','Evaluation & deployment handoff'),pair('待补充测试集、评估方法、检测效果与模型产物，建立训练权重和端侧转换版本之间的对应关系。','Add test sets, evaluation methods, predictions and model artifacts, linking training weights to converted deployment versions.')]
 ],
 deploy: [
 [pair('部署环境与模型','Deployment environment & model'),pair('待记录板卡、系统、工具链、模型来源、输入尺寸及量化配置，确保使用对应平台的部署流程。','Record board, OS, toolchain, model source, input size and quantization settings using the deployment flow for that platform.')],
 [pair('输入、推理与后处理','Input, inference & postprocessing'),pair('待记录输入来源、色彩格式、预处理、推理接口和后处理配置，核对训练与部署的输入输出定义。','Record input source, color format, preprocessing, inference interface and postprocessing, checking consistency with the trained model.')],
 [pair('检测效果与运行证据','Detection results & evidence'),pair('待上传真实检测截图或视频、运行日志与复现步骤。性能数据应注明测量范围与测试条件。','Upload real detection screenshots or videos, logs and reproduction steps. Performance data must include measurement scope and test conditions.')]
 ],
 optimize: [
 [pair('建立性能基线','Establish a baseline'),pair('固定板卡、系统、模型、输入、线程与运行条件，记录预热和测量方法，再进行优化。','Fix board, system, model, input, threads and operating conditions; document warm-up and measurement methods before optimization.')],
 [pair('拆解各阶段耗时','Profile pipeline stages'),pair('分别记录采集、预处理、推理、后处理和显示耗时，区分推理延迟、端到端延迟与吞吐率。','Measure capture, preprocessing, inference, postprocessing and display separately. Distinguish inference latency, end-to-end latency and throughput.')],
 [pair('优化与回归验证','Optimization & regression checks'),pair('待逐项记录改动、优化前后数据和精度变化。跨平台对比须明确配置差异；不预填 FPS 或加速比。','Record each change, before/after measurements and accuracy impact. Explain configuration differences in cross-platform comparisons; do not prefill FPS or speedups.')]
 ]
};
