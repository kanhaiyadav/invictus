#!/usr/bin/env node

import './src/command.js';
import updateNotifier from "update-notifier";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
    fs.readFileSync(join(__dirname, "./package.json"), "utf8")
);
updateNotifier({ pkg: packageJson }).notify();