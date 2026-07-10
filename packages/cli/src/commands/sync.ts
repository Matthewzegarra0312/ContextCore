import path from "node:path";
import { compile, writeCompiledOutputs, compileContextMd, writeContextMd } from "@contextcore/core";

export async function sync(): Promise<void> {
  const cwd = process.cwd();
  const compiled = compile(cwd);
  const paths = writeCompiledOutputs(cwd, compiled);
  const contextMdPath = writeContextMd(cwd, compileContextMd(cwd));

  console.log(`[contextcore sync] Compilado (~${compiled.tokenEstimate} tokens estimados)`);
  console.log(`[contextcore sync] Escrito ${path.relative(cwd, paths.agents)}`);
  console.log(`[contextcore sync] Escrito ${path.relative(cwd, paths.claude)}`);
  console.log(`[contextcore sync] Escrito ${path.relative(cwd, paths.cursorRule)}`);
  console.log(`[contextcore sync] Escrito ${path.relative(cwd, contextMdPath)}`);
}
