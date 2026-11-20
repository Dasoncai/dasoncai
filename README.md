# Dasoncai / RDK Vision Lab

Bilingual camera and edge-AI experiment catalog for RDK X5 and RDK S100, published on GitHub Pages.

Site: https://dasoncai.github.io/dasoncai/

## Add a case

Read [the publishing guide](AUTHORING.md). Copy a template from `templates/` to `content/articles/`, fill the YAML metadata and Markdown body, and put media in `assets/<case-id>/`. Set `draft: false` to publish. No frontend code changes are needed.

- `templates/camera.zh.md`: Sensor integration, bring-up, image debugging and ISP.
- `templates/model.zh.md`: model training, edge inference and performance optimization.
- `templates/metrics.csv`: performance data header; fill with real measurements.

Supports local images, MP4/WebM playback, external HTTPS video links, CSV measurement tables/downloads, logs and source links. Markdown tables, fenced code and generated article contents are supported. One-language articles display an explicit fallback notice in the other interface language.

## Preview and checks

```shell
python -m pip install -r requirements.txt
python -m unittest discover -s tests
python scripts/build.py
node tests/catalog.test.mjs
python -m http.server 4173 --directory _site
```

Open http://localhost:4173/. ES modules require HTTP. Rebuild and reload after edits. Node is only needed for the catalog check; Python builds the website.

`_site/` is generated and ignored. GitHub Actions runs the same checks, builds and publishes only public pages, generated article data and referenced assets. Draft articles and unreferenced assets are excluded from the website, but all files committed to this public GitHub repository remain public in its source/history.

## Plans and verified records

`planned` means an experiment plan. `verified` means the author has validated the documented scope; the build requires date, environment, scope, conclusion, limitations and evidence. It checks completeness, not the truth of hardware claims or measurements. Current eight cases remain plans pending real evidence.

Sensor models, model families and tasks are collected from published Markdown metadata. Shutter types and connections remain separate. Connection filters include Direct MIPI, USB, SerDes and Internet Protocol Camera. Unknown connections remain unclassified and are not relabeled as IP cameras.

Layout inspired by the general light catalog style of RDK Model Zoo. No upstream code, logos or experimental results were copied. This is an independent personal lab, not official RDK documentation.
