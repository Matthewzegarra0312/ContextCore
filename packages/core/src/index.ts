export type { ContextEvent } from "./types.js";
export type { DetectedStack } from "./detectStack.js";
export { detectStack } from "./detectStack.js";
export { getAuthor } from "./author.js";
export { getContextCoreDir, getAuthorLogPath } from "./paths.js";
export { appendEvent, readAllEvents } from "./storage.js";
export { insertEventBestEffort } from "./supabase.js";
export type { ContextCoreCredentials } from "./credentials.js";
export {
  getCredentialsPath,
  readCredentials,
  writeCredentials,
  clearCredentials,
} from "./credentials.js";
export type { CompiledContext, CompiledOutputPaths } from "./compile.js";
export { compile, writeCompiledOutputs } from "./compile.js";
export { buildEventFromLastCommit } from "./captureFromCommit.js";
export { captureEventViaSummarizer } from "./llmCapture.js";
export type { HookInstallResult } from "./gitHook.js";
export { installPostCommitHook } from "./gitHook.js";
