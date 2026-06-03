---
"@xubylele/jinja2-enhanced-shared": patch
---

Template preview now resolves `{% extends %}` and `{% include %}` tags when `templateRoots` is passed to `renderTemplate`. Previously, templates using inheritance rendered as raw Jinja2 source.
