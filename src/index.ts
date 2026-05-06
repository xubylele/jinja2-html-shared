export { extractVariables, analyzeNestedStructures } from './variableAnalyzer';
export { extractVariableName } from './diagnosticMessage';
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
export {
  renderTemplate,
  findMissingVariables,
} from './templateRenderer';
export type { RenderResult, RenderOptions } from './templateRenderer';
