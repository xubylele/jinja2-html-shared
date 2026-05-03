export { extractVariables, analyzeNestedStructures } from './variableAnalyzer';
export { extractVariableName } from './diagnosticMessage';
export {
  scanBackendOccurrences,
  normalizeTemplateKey,
  identifierAtOffset,
} from './backendScanner';
export type { BackendLang, BackendVarOccurrence } from './backendScanner';
export {
  scanTemplateRelations,
  extractMacroDefinitions,
} from './templateRelations';
export type {
  TemplateRelations,
  TemplatePathOccurrence,
  TemplateImportOccurrence,
  TemplateImportKind,
  TemplateImportName,
  MacroDefinition,
  MacroParam,
} from './templateRelations';
export { resolveTemplatePath } from './templatePath';
