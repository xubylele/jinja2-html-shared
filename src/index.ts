export { extractVariables, analyzeNestedStructures } from './variableAnalyzer';
export { extractVariableName } from './diagnosticMessage';
export {
  scanBackendOccurrences,
  normalizeTemplateKey,
  identifierAtOffset,
  filterAtOffset,
} from './backendScanner';
export type { BackendLang, BackendVarOccurrence } from './backendScanner';
export {
  scanTemplateRelations,
  extractMacroDefinitions,
  extractBlockDefinitions,
  extractMacroCalls,
  calculateNestingDepth,
  isVariableUsed,
} from './templateRelations';
export type {
  TemplateRelations,
  TemplatePathOccurrence,
  TemplateImportOccurrence,
  TemplateImportKind,
  TemplateImportName,
  MacroDefinition,
  MacroParam,
  BlockDefinition,
  MacroCall,
} from './templateRelations';
export { resolveTemplatePath } from './templatePath';
