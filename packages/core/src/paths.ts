import path from "node:path";

export function getContextCoreDir(cwd: string = process.cwd()): string {
  return path.join(cwd, ".contextcore");
}

export function getAuthorLogPath(author: string, cwd: string = process.cwd()): string {
  return path.join(getContextCoreDir(cwd), `${author}.jsonl`);
}
