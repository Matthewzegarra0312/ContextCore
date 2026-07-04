export interface ContextEvent {
  author: string;
  timestamp: string;
  module: string;
  intent: string;
  decisions: string[];
  gotchas: string[];
}
