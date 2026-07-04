#!/usr/bin/env node
import { init } from "./commands/init.js";
import { sync } from "./commands/sync.js";
import { status } from "./commands/status.js";

const [, , command] = process.argv;

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
  default:
    console.log("Uso: contextcore <init|sync|status>");
    process.exit(1);
}
