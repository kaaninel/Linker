#!/usr/bin/env node

const args = process.argv.slice(2);
const {
  execSync
} = require("child_process");
const path = require('path');

if(args.length) {
  if(args[0] === "create" && args[1]) {
    execSync(`cp -a ${path.resolve(__dirname ,"./Proto")}/. ${process.cwd()}/${args[1]}`);
  }
} else {
  require("./Dist/Compiler.js");
}