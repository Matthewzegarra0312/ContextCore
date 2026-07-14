export interface ContextEvent {
  author: string;
  timestamp: string;
  module: string;
  intent: string;
  decisions: string[];
  gotchas: string[];
  // Changelog literal (el "qué", no el "por qué"): archivos, librerías, UI o
  // config concretos que se agregaron/modificaron/borraron. Complementa a
  // decisions/gotchas, que se enfocan en intención y no repiten el diff.
  changes: string[];
}
