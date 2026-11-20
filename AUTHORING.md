# 新增 Sensor 案例与模型实践

不需要修改页面代码。新增 Markdown、上传素材、提交到 main 后，GitHub Actions 会校验、构建并发布。

## 1. 选择模板

- 相机接入 / ISP：复制 `templates/camera.zh.md` 到 `content/articles/my-sensor-x5.zh.md`。
- 模型训练 / 推理 / 优化：复制 `templates/model.zh.md` 到 `content/articles/my-yolo-x5.zh.md`。
- 性能数据：复制 `templates/metrics.csv` 到案例素材目录，再添加真实测量行。

文件名建议与文章 ID 一致。ID 必须全站唯一，使用小写字母、数字与连字符；发布后保持 ID 稳定，详情链接会一直有效。

## 2. 填写开头的文章信息

Markdown 开头两条 `---` 之间是 YAML 信息区。保持缩进，字符串中含冒号时加引号。

- `id`：例如 `my-sensor-x5`。
- `lang`：`zh` 或 `en`。
- `kind`：`camera` 或 `models`。
- `title` / `description`：标题与摘要，自动出现在目录和搜索中。
- `draft: true`：草稿，完全不进入发布目录；准备好后改成 `false`。
- `status: planned`：实验计划；`verified`：作者已验证。
- `platforms: [RDK X5]` 或 `[RDK S100]`：案例适用的平台。共同验证可填两个；计划中填写目标平台。
- 相机字段：`sensor` 填具体型号；`shutter` 填 `rolling` / `global` / `unknown`；`connection` 填 `Direct MIPI` / `USB` / `SerDes` / `Internet Protocol Camera`。尚未确认时可保留 `unknown`，不会误归类到 IP Camera。
- 相机 `stage`：`capture` 或 `isp`。
- 模型字段：`family`、`model_version`、`task`；`task: detection` 表示目标检测，也可写其他任务名称。型号、模型系列和任务筛选会自动读取文章信息。
- 模型 `stage`：`train` / `deploy` / `optimize`。
- `related: [另一个案例id]`：关联文章；无关联填写 `[]`。

“接入方式”筛选已使用 Internet Protocol Camera；`unknown` 仅供尚未确认的记录内部使用，卡片不显示此接口标签。

## 3. 写 Markdown 正文

使用 `##`、`###` 分节，会自动生成右侧目录。支持段落、列表、引用、代码块、链接、图片和 Markdown 表格。图片和性能表格在手机上也可浏览。

不需要写 HTML；脚本、iframe 和不支持的 HTML 会让构建失败。图片使用本地素材，外部页面链接使用 HTTPS。

正文相对路径以 Markdown 文件所在目录为基准：

```markdown
## 点亮步骤

1. 记录硬件连接。
2. 填写实际执行的命令。

![实际采集画面](../../assets/my-sensor-x5/capture.webp)

[采集日志](../../assets/my-sensor-x5/capture.log)
```

素材不存在时会阻止发布，避免上线后显示破图。代码块中的图片语法只作为文字展示，不会被当成文件引用。

## 4. 上传图片和演示视频

建立 `assets/案例id/`，例如：

```text
content/articles/my-sensor-x5.zh.md
assets/my-sensor-x5/capture.webp
assets/my-sensor-x5/demo.mp4
assets/my-sensor-x5/capture.log
```

文章信息区中的 `cover` / `gallery` / `videos` / `evidence` 路径以仓库根目录为基准，从 `assets/` 开始。模板已提供可取消注释的完整示例。注意替换原来的 `gallery: []` 等字段，不要保留两个同名字段。

- `cover`：目录卡片封面；`kind` 标注 `capture`（实拍）、`screenshot`（截图）或 `illustration`（示意）。
- `gallery`：可放同场景调优前后图片，每张填写 `alt` 与 `caption`；点击可打开原图。
- `videos`：本地 `src` 自动显示播放器。MP4 建议使用 H.264 视频与 AAC 音频；不支持的编码需先转换。浏览器实际可播放性取决于编码。
- `videos` 的 `poster` 为可选封面，`captions` 为可选 VTT 字幕。
- 大型演示可使用 `url: https://...`，网站显示“打开视频平台观看”，不会自动嵌入外部播放器。
- `evidence`：本地日志/配置文件用 `src`，外部代码提交和附件用 `url`。

## 5. 更新性能数据

CSV 固定表头：

```csv
variant,metric,value,unit,samples
```

每行依次填写：配置名称、指标名称、非负数测量值、单位、正整数样本数。可以分别记录基线与优化配置；有逗号的文本应使用 CSV 双引号。

模板 CSV 仅含表头，没有虚构数据。填入至少一行真实数据后再引用。

文章信息区添加 `performance`，填写 CSV 路径、图表说明 `caption`、测试方法 `methodology` 和条件 `conditions`。模板中有完整示例。页面自动显示表格、条件、样本数与原始 CSV 下载链接，不会把不同单位的数据混合计算。

请记录模型版本、输入尺寸、量化方式、平台/系统/SDK、线程与并发、预热、测量次数和计时边界。推理耗时、端到端延迟、吞吐率以及采集帧率分开记录。跨平台比较时说明配置差异。

## 6. 从“实验计划”改为“已验证”

改为 `status: verified`，并同时填写：

- `verified_on: "YYYY-MM-DD"`：实际验证日期。
- `environment`：非空的环境版本记录。
- `validation_scope`：准确的验证范围。
- `conclusion`：有证据支持的结论。
- `limitations`：限制、已知问题或未验证项。
- 至少一种证据：实拍/截图画廊、演示视频、性能 CSV，或日志/源码等 `evidence` 附件。

仅示意图不算验证证据。构建检查资料是否完整，**不会替作者确认硬件真实性、图像质量或测量准确性**；“已验证”表示作者声明的范围内完成验证。

## 7. 中英文文章

中文与英文使用相同 `id`，分别保存为 `案例id.zh.md`、`案例id.en.md`。`title`、`description`、正文和素材说明可翻译；平台、状态、关联案例等公共分类信息必须一致。

只有中文时也可正常发布。切换到英文界面时会明确提示“暂无英文版本”，正文仍显示中文，不会伪装成翻译。只有英文时同理。

如果一版还是草稿，可先发布另一版；但两版同时发布时必须保持分类和验证状态一致。

## 8. 预览与发布

本地首次安装：

```shell
python -m pip install -r requirements.txt
```

每次修改后：

```shell
python -m unittest discover -s tests
python scripts/build.py
python -m http.server 4173 --directory _site
```

打开 http://localhost:4173/。构建产物 `_site/` 不需提交。

将文章和素材提交到 main，查看仓库 Actions 中的 “Deploy GitHub Pages”。成功后访问 https://dasoncai.github.io/dasoncai/ 。校验失败会保留上一次成功发布的网站，修正报错后重新提交即可。

在 GitHub 网页操作时，同样先上传素材，再创建 Markdown 文件并填写文章信息，最后把 `draft` 改为 `false`。草稿源文件仍位于公开仓库，因此不要在任何提交中放入私密信息。
