---
"@xubylele/jinja2-enhanced-shared": patch
---

Add `filterAtOffset()` utility function to detect if an identifier at a given offset is a Jinja2 filter name (preceded by `|` pipe character). This reuses the existing `identifierAtOffset()` function and checks for `|` in the same expression. This utility will be used by the Pro extension's upcoming "Filter Docs on Hover" feature to provide hover documentation for Jinja2 built-in filters.
