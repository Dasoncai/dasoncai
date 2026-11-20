# Dasoncai / RDK Vision Lab

Bilingual camera and edge-AI experiment catalog for RDK X5 and RDK S100. A light, card-based interface with independent camera/model filters, search, shareable filter URLs, detail pages, notes and about views.

## Local preview

Serve this directory over HTTP, for example `python -m http.server 4173`, then open http://localhost:4173/. ES modules require HTTP; opening the HTML directly from disk is not supported.

## Content

Edit `core.mjs`. Each experiment has a stable ID, bilingual title/description, target platforms, stage, filter metadata and related experiment IDs. Camera records have sensor/shutter/connection fields; model records have task/family fields. Detail outlines are stored by workflow stage.

Current records are **experiment plans**, not verified integrations or benchmarks. All covers are original SVG illustrations and explicitly labeled as illustrations. Sensor models and shutter types remain unknown until actual hardware is supplied. A card targeting both platforms does not claim either has been validated. Training platform tags refer to deployment targets, not training hosts.

When publishing results, add real evidence, environment/SDK versions, configuration, reproduction steps, code revisions and measurement conditions. Update the content schema and UI status together; never relabel a plan as verified without evidence. Keep camera interfaces and shutter types separate. SerDes is a connection category; record the actual link protocol and board-side interface in the experiment details.

## Deployment

https://dasoncai.github.io/dasoncai/

Push main to deploy with GitHub Actions. The workflow stages an explicit public-file allowlist so repository metadata, notes and development files are not published.

## License / attribution

Layout inspired by the general light catalog style of RDK Model Zoo. No upstream code, logos, images or experimental results were copied. This is an independent personal lab, not official RDK documentation.
