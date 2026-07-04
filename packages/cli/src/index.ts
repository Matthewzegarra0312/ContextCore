#!/usr/bin/env node
import { init } from "./commands/init.js";
import { sync } from "./commands/sync.js";
import { status } from "./commands/status.js";
import { log } from "./commands/log.js";

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
  default:
    console.log("Uso: contextcore <init|sync|status|log>");
    process.exit(1);
}
