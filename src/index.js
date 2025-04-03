#!/usr/bin/env -S node --title=i3-shade

const { usage, helpText } = require('./help')

const argDefaults = {
  prefix: "shade",
  exempt: "shade_exempt",
  command: "nop i3-shade-exempt",
  fallback: null,
  peek: 2
}

// Parse args, if any
const args = require('minimist')(process.argv.slice(2))
if (args.h || args.help) {
  args.h ?
  console.log(usage)
  :
  console.log(helpText);
  process.exit(0);
}

// Validation: no underscores in prefix
if (args.prefix && args.prefix.indexOf("_") > -1) {
  console.error("ERROR, remove/replace underscore(s) in prefix option")
  process.exit(1)
}

// Format strings
const exemptComStr = args.command ?? argDefaults.command
const markPref = (args.prefix ?? argDefaults.prefix) + "_"
const exemptMarkPref = "_" + (args.exempt ?? argDefaults.exempt) + "_"
const socketPath = args.socketpath ?? ""
const fallback = args.fallback ?? ""
const peekVal = Number.parseInt(args.peek)
const peek = Number.isInteger(peekVal) ? Math.max(argDefaults.peek, peekVal) : argDefaults.peek

// Extraneous options
const argKeys = Object.keys(args).slice(1)
const argDefaultsKeys = Object.keys(argDefaults)
const isNotInDefaults = key => !argDefaultsKeys.includes(key)
if (argKeys.some(isNotInDefaults)) {
  console.error(
    "Invalid option(s):", 
    argKeys.filter(isNotInDefaults).join(", ")
  )
  process.exit(1)
}

Shade = require('./lib/shade')
i3shade = new Shade(markPref, exemptMarkPref, socketPath, exemptComStr, fallback, peek).connect()
