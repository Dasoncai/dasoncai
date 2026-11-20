---
id: my-sensor-x5
lang: zh
kind: camera
title: "替换为 Sensor 型号 · RDK X5 接入验证"
description: "用一两句话说明本案例的目标、接入方式和验证内容。"
draft: true
status: planned
platforms: [RDK X5]
sensor: unknown
shutter: unknown
connection: Direct MIPI
stage: capture
related: []
environment: {}
cover: null
gallery: []
videos: []
performance: null
evidence: []
# 发布：填完后将 draft 改为 false。状态：planned / verified。
# 平台：[RDK X5] 或 [RDK S100]；两个平台都验证后可同时填写。
# shutter：rolling / global / unknown。
# connection：Direct MIPI / USB / SerDes / Internet Protocol Camera / unknown。
# stage：capture（接入点亮）或 isp（图像调试与 ISP）。
# 已验证时取消注释并填写；不能仅改 status：
# verified_on: "YYYY-MM-DD"
# validation_scope: "明确板卡、Sensor、模式与本次测试覆盖范围。"
# conclusion: "填写有证据支持的结果。"
# limitations: "填写未验证项、已知问题和适用边界。"
# environment:
#   系统镜像: "具体版本"
#   SDK: "具体版本"
#   内核: "具体版本"
# 素材路径以仓库根目录的 assets/ 开头。必须先上传对应文件。
# cover:
#   src: assets/my-sensor-x5/capture.webp
#   alt: "实拍画面的文字说明"
#   kind: capture
# gallery:
#   - src: assets/my-sensor-x5/capture.webp
#     alt: "图像内容说明"
#     caption: "场景、分辨率、曝光或其他条件说明"
#     kind: capture
#   - src: assets/my-sensor-x5/isp-after.webp
#     alt: "调优后图像"
#     caption: "与调优前图片保持相同场景，注明参数变化"
#     kind: capture
# videos:
#   - src: assets/my-sensor-x5/demo.mp4
#     poster: assets/my-sensor-x5/capture.webp
#     title: "采集演示"
#     caption: "注明录制环境与演示内容"
#   - url: https://www.bilibili.com/video/替换为实际视频ID/
#     title: "完整演示"
#     caption: "点击后前往视频平台播放"
# evidence:
#   - src: assets/my-sensor-x5/capture.log
#     title: "采集原始日志"
#   - url: https://github.com/替换为实际代码提交地址
#     title: "源码版本与配置"
---

## 实验目标与范围

说明为什么接入这款相机，本次要验证哪些模式。当前状态为实验计划，请勿把预期结果写成实测结论。

## 硬件与连接

- Sensor / 模组：待补充
- 镜头、供电、接口与线缆：待补充
- 接线照片与注意事项：待补充

## 软件环境

在开头的 environment 中填写版本；这里补充安装与配置步骤。

## 接入与点亮步骤

用编号步骤和代码块记录你实际执行的命令。

```shell
# 替换为本次实际使用的命令与参数
```

## 调试与问题排查

### 问题现象

待补充。

### 排查过程与根因

待补充。

### 解决办法

待补充，关联配置修改与源码提交。

## 图像与 ISP 调试

图片可以通过上方 gallery 集中展示，也可以在正文使用 Markdown：

```markdown
![实拍图说明](../../assets/my-sensor-x5/capture.webp)
```

上述代码块仅演示语法，不会加载图片。上传图片后，可把图片语句移出代码块。

## 结果与限制

记录实际分辨率、采集帧率、稳定性测试条件、已知限制与未验证项。

## 复现方法

列出配置文件、代码版本和完整操作顺序。附件可在上方 evidence 中填写。
