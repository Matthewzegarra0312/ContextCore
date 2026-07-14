export interface ContextEventRow {
  id?: number;
  author: string;
  timestamp: string;
  module: string;
  intent: string;
  decisions: string[];
  gotchas: string[];
  changes: string[];
}
