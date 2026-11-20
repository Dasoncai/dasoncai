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
lang: en
title: Performance · Latency & throughput
description: Plan to profile capture, preprocessing, inference and postprocessing
  under documented test conditions.
draft: false
---

## Establish a baseline

Fix board, system, model, input, threads and operating conditions; document warm-up and measurement methods before optimization.

## Profile pipeline stages

Measure capture, preprocessing, inference, postprocessing and display separately. Distinguish inference latency, end-to-end latency and throughput.

## Optimization & regression checks

Record each change, before/after measurements and accuracy impact. Explain configuration differences in cross-platform comparisons; do not prefill FPS or speedups.

## Results & attachments

Captured images, videos, logs and performance data are pending.
