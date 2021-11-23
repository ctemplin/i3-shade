#!/usr/bin/env -S node --title=i3-shade

const usage = "usage: i3-shade [-h|--help] [--prefix=<string>] [--exempt=<string>] [--command=<string>]"

const argDefaults = {
  prefix: "shade",
  exempt: "shade_exempt",
  command: "nop i3-shade-exempt"
}

// Parse args, if any
const args = require('minimist')(process.argv.slice(2))
if (args.h || args.help) {
  args.h ?
  console.log(usage)
  :
  console.log("i3-shade\n\
    -h            Show brief usage summary.\n\
    --help        Show this message.\n\
    --prefix=<string>\n\
                  Defaults to \"shade\". Included in mark that stores \n\
                  floating window position. No need to set unless default\n\
                  conflicts with other marks.\n\
                  <prefix>_<x>_<y>_<con_id> \n\
    --exempt=<string>\n\
                  Defaults to \"shade_exempt\". Included in mark that exempts\n\
                  containers from shading. No need to set unless default\n\
                  conflicts with other marks.\n\
                  _<exempt>_<con_id> \n\
    --socketpath=<string>\n\
                  Defaults to output of `i3 --get-socketpath`.\n\
    --command=<string>\n\
                  Defaults to \"nop i3-shade-exempt\". The i3 command to toggle\n\
                  the shading exemption for the focused window. \n\
");
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
i3shade = new Shade(markPref, exemptMarkPref, socketPath, exemptComStr).connect()
