export interface EvaluationMethod {
  exactMatch?: {
    value: number | boolean | string;
    type: 'number' | 'boolean' | 'string';
  };
  range?: {
    min: number;
    max: number;
  };
  csvMatch?: {
    expectedValues: string[];
    caseSensitive: boolean;
  };
  booleanMatch?: {
    expectedValue: string;
  };
}
