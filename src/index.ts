export { extractVariables, analyzeNestedStructures } from './variableAnalyzer';
export { extractVariableName } from './diagnosticMessage';
export {
  scanBackendOccurrences,
  normalizeTemplateKey,
  identifierAtOffset,
} from './backendScanner';
export type { BackendLang, BackendVarOccurrence } from './backendScanner';
