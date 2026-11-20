---
id: performance
kind: models
platforms:
- RDK X5
- RDK S100
status: planned
sensor: unknown
shutter: unknown
family: YOLO
task: detection
stage: optimize
related:
- x5-yolo
- s100-yolo
lang: zh
title: 性能优化 · 从耗时到吞吐
description: 计划拆解采集、预处理、推理与后处理，记录优化前后的测试条件。
draft: false
---

## 建立性能基线

固定板卡、系统、模型、输入、线程与运行条件，记录预热和测量方法，再进行优化。

## 拆解各阶段耗时

分别记录采集、预处理、推理、后处理和显示耗时，区分推理延迟、端到端延迟与吞吐率。

## 优化与回归验证

待逐项记录改动、优化前后数据和精度变化。跨平台对比须明确配置差异；不预填 FPS 或加速比。

## 成果与附件

实拍图、演示视频、运行日志与性能数据待补充。
