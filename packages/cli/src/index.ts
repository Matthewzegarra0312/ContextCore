#!/usr/bin/env node
import { init } from "./commands/init.js";
import { sync } from "./commands/sync.js";
import { status } from "./commands/status.js";
import { log } from "./commands/log.js";
import { capture } from "./commands/capture.js";

const [, , command, ...rest] = process.argv;

switch (command) {
  case "init":
    await init();
    break;
  case "sync":
    await sync();
    break;
  case "status":
    await status();
    break;
  case "log":
    await log(rest);
    break;
  case "capture":
    await capture();
    break;
  default:
    console.log("Uso: contextcore <init|sync|status|log|capture>");
    process.exit(1);
}
