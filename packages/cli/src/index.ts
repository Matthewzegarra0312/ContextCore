#!/usr/bin/env node
import "dotenv/config";
import { init } from "./commands/init.js";
import { sync } from "./commands/sync.js";
import { status } from "./commands/status.js";
import { log } from "./commands/log.js";
import { capture } from "./commands/capture.js";
import { login } from "./commands/login.js";
import { logout } from "./commands/logout.js";
import { getVersion, printHelp } from "./ui.js";

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
  case "login":
    await login();
    break;
  case "logout":
    await logout();
    break;
  case undefined:
  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;
  case "--version":
  case "-v":
    console.log(getVersion());
    break;
  default:
    console.log(`Comando desconocido: "${command}"`);
    console.log('Corre "contextcore --help" para ver los comandos disponibles.');
    process.exit(1);
}
