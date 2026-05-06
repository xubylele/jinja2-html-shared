---
"@xubylele/jinja2-enhanced-shared": patch
---

Remove pro-only backendScanner module from shared package. The backend scanning logic (scanBackendOccurrences, identifierAtOffset, filterAtOffset, normalizeTemplateKey) is now moved to the pro extension's local src/intelligence/ directory. Shared package now only contains utilities used by both free and pro extensions.
