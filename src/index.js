#!/usr/bin/env -S node --title=i3-shade
const exec = require('child_process').exec

const { usage, helpText } = require('./help')

const argDefaults = {
  prefix: "shade",
  exempt: "shade_exempt",
  exemptCallbackExec: ":", // no operation
  // exemptCallbackExec: 'notify-send -u normal -t 750 "I3-SHADE: Exempt Toggled"',
  // exemptCallbackExec: "source ~/.bashrc.d/i3-current-workspace.sh && i3-notify-has-mark _shade_exempt",
  command: "nop i3-shade-exempt",
  fallback: null,
  peek: 2,
  urgent: false
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
const exemptCallbackExec = (args.exemptCallbackExec ?? argDefaults.exemptCallbackExec)
const socketPath = args.socketpath ?? ""
const fallback = args.fallback ?? ""
const peekVal = Number.parseInt(args.peek)
const peek = Number.isInteger(peekVal) ? Math.max(argDefaults.peek, peekVal) : argDefaults.peek
const doUrgent = Boolean(args.urgent)

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
i3shade = new Shade(markPref, exemptMarkPref, socketPath, exemptComStr, fallback, peek, doUrgent)
  .connect(
    callbacks = {
      markExempt:
        (stream) => exec('bash -c "$EXEMPT_CALLBACK_EXEC"',
        { env: 
          {
            ...process.env,
            // NOTE: the following two envars are needed by i3/notify-send
            // DISPLAY: process.env.DISPLAY || ':0',
            // DBUS_SESSION_BUS_ADDRESS: process.env.DBUS_SESSION_BUS_ADDRESS,
            EXEMPT_CALLBACK_EXEC: exemptCallbackExec
          } 
        },
        ((error, stdout, stderr) => {
          if (error) {
            console.log(`${error.name}: ${error.message}`);
            return;
          }
        })
      )
    }
  )
