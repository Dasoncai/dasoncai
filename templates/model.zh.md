---
id: my-yolo-x5
lang: zh
kind: models
title: "替换为模型版本 · RDK X5 实践"
description: "用一两句话说明训练、部署或优化目标。"
draft: true
status: planned
platforms: [RDK X5]
family: YOLO
model_version: unknown
task: detection
stage: deploy
related: []
environment: {}
cover: null
gallery: []
videos: []
performance: null
evidence: []
# stage：train（训练）/ deploy（端侧推理）/ optimize（性能优化）。
# 训练案例的 platforms 是目标部署平台；训练主机单独写入 environment。
# platforms 可改为 [RDK S100]；draft 改为 false 后才进入网站目录。
# 已验证时填写 environment，并取消注释以下字段：
# verified_on: "YYYY-MM-DD"
# validation_scope: "模型、输入尺寸、平台与实际验证范围"
# conclusion: "有证据支持的结论"
# limitations: "未验证项与已知限制"
# environment:
#   系统镜像: "具体版本"
#   SDK与工具链: "具体版本"
#   模型与量化: "具体版本 / 精度"
#   输入尺寸: "宽 x 高"
# 性能数据必须为真实测量，CSV 表头固定为：
# variant,metric,value,unit,samples
# performance:
#   csv: assets/my-yolo-x5/metrics.csv
#   caption: "基线与优化后性能，注明测量口径"
#   methodology: "填写预热次数、测量次数、计时边界、是否含采集/显示等"
#   conditions:
#     平台与系统: "RDK X5 / 实际系统版本"
#     模型与输入: "实际模型版本 / 输入尺寸 / 量化方式"
#     运行条件: "线程、并发、频率与其他必要条件"
# gallery:
#   - src: assets/my-yolo-x5/detection.webp
#     alt: "检测画面的文字说明"
#     caption: "数据来源、模型信息与场景说明"
#     kind: screenshot
# videos:
#   - src: assets/my-yolo-x5/demo.mp4
#     poster: assets/my-yolo-x5/detection.webp
#     title: "端侧检测演示"
#     caption: "注明输入来源、运行环境与演示内容"
# evidence:
#   - src: assets/my-yolo-x5/run.log
#     title: "运行日志"
#   - url: https://github.com/替换为实际代码提交地址
#     title: "源码与复现配置"
---

## 目标与适用范围

说明是训练、转换部署、推理验证还是性能优化，标明预期与实际结果的区别。

## 数据集与模型

- 来源、许可与类别：待补充
- 模型版本、权重与输入尺寸：待补充
- 训练 / 验证 / 测试集划分：待补充

## 环境与配置

训练主机和部署板卡分别记录，包含框架、工具链与系统版本。

## 实践步骤

### 训练或模型准备

记录配置、参数、权重和评估方法。

### 模型转换与部署

按对应平台的实际流程记录步骤与产物版本。

### 输入处理与后处理

记录色彩格式、归一化、阈值和后处理，核对训练与部署的一致性。

## 效果与性能

上传真实检测截图或演示视频。通过 performance 引用 CSV，页面会自动生成性能表格和下载入口。

分别记录：采集帧率、推理延迟、端到端延迟、吞吐率。模型精度与运行性能分开说明，不用吞吐率倒数代替单帧延迟。

## 优化过程

每次只记录可追踪的改动，保持对比条件一致，说明性能变化和精度影响。

## 结论、限制与复现

说明验证结论、适用范围、未验证内容和复现步骤；附日志、配置与代码提交。
