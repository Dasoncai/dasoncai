---
id: sc233hgs-x5
kind: camera
draft: false
status: planned
platforms:
- RDK X5
sensor: SC233HGS
shutter: global
connection: unknown
stage: capture
related:
- x5-mipi
- isp-workflow
- x5-yolo
cover: null
gallery: []
videos: []
performance: null
lang: en
title: SC233HGS · RDK X5 bring-up, RAW & IQ
description: Planned module integration, driver deployment, RAW capture and preview,
  IQ tuning and YUV validation on RDK X5.
environment:
  Board: RDK X5
  OS image: Pending
  SDK / kernel: Pending
evidence:
- url: https://smartsens.oss-cn-beijing.aliyuncs.com/web/img/1785808512066250127.pdf
  title: SC233HGS official product flyer (reference, not test evidence)
# 上传素材后可填写 cover / gallery / videos / performance。
# cover: {src: assets/sc233hgs-x5/raw-preview.webp, alt: "RAW 预览", kind: screenshot}
# gallery:
#   - {src: assets/sc233hgs-x5/board-connection.webp, alt: "实际接线", caption: "记录端口与排线方向", kind: capture}
# videos:
#   - {src: assets/sc233hgs-x5/preview.mp4, title: "预览演示", caption: "注明环境与格式"}
---

## Goal and current status

Integrate an SC233HGS camera module with RDK X5, deploy the driver, capture RAW data and validate a preview, then investigate IQ tuning and YUV output with reproducible configurations and evidence.

**This is an experiment plan. Module/connection photos, driver configuration, capture logs and real images have not yet been supplied. No completed bring-up is claimed.**

## CMOS image sensor brief

Source: [SmartSens SC233HGS Product Flyer](https://smartsens.oss-cn-beijing.aliyuncs.com/web/img/1785808512066250127.pdf), specifications on PDF page 2.

The brief identifies SC233HGS as a BSI global-shutter CMOS sensor, with a 2.3MP class, a 1928 × 1208 pixel array, 3.0 μm pixels and a 1/2.6-inch optical format. It lists RAW color/mono outputs and MIPI, DVP and LVDS interface capabilities. The actual module variant, exposed interface and board connection remain unconfirmed.

The listed 1920 × 1200 frame-rate specifications are chip-level information, not measured RDK X5 results. This product flyer does not replace a complete datasheet, module schematic, pinout or confirmed register initialization sequence. No I²C address, lane count, clocks, Bayer order or register values are assumed.

## Module photos and board connection

Collect module front/back views, an overall RDK X5 connection photo, connector/cable close-ups and the test scene. Confirm module vendor/model, color or monochrome variant, connection type, port, cable pinout and power arrangement before recording a concrete configuration.

## Driver deployment and environment

Record OS image, SDK, kernel, driver source and configuration revisions. Check whether the current environment already provides an SC233HGS driver, document changes, and record actual build/install/deployment commands and logs after confirming the environment. Do not reuse values from another sensor as SC233HGS configuration.

## RAW capture and preview

Record image dimensions, RAW bit depth, color/mono information, Bayer order where applicable, packing, stride, planes, file sizes, frame counts and timestamp progression. Validate newly captured frames using the actual memory layout.

Document the preview tool and its configuration. If an offline RAW conversion is used, retain the original frames and explain the conversion; that preview is distinct from board-side ISP YUV output and final IQ results.

## ISP path, IQ tuning and YUV output

After RAW validation, record the loaded ISP/tuning configuration and verify YUV acquisition. Retain original YUV files, logs, output format, plane/stride details, resolution and preview conversion settings. Do not assume NV12 or tightly packed YUV420 before checking the actual layout.

Confirm whether the module is color or monochrome, and choose applicable tuning work accordingly. Capture controlled-scene before/after comparisons with parameter and configuration revisions. Receiving YUV proves the relevant output path is working; completed IQ tuning requires separate image-quality evidence and conclusions.

## Results, troubleshooting and reproduction

Pending: module/connection photos, RAW frames and previews, deployment logs and source revisions, original YUV, IQ comparisons, demo videos, issue investigation and a complete reproduction sequence. Measured frame rates, latency and image-quality metrics will be added only after testing.
