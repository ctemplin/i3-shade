#!/usr/bin/env -S node --title=i3-shade

const i3 = require('i3').createClient();
const sprintf = require('sprintf-js').sprintf
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

const exemptMarkPat = exemptMarkPref + "%s"
const peekMargin = 2;
var fcsdWsNum, fcsdWinId, fcsdWinMarks;

// Get the initial focused WS num
i3.workspaces((err, json) => {
  fcsdWsNum = json.find(ws => ws.focused).num
})

const handleWorkspaceEvent = function(event) {
  if (event.change == "focus") {
    fcsdWsNum = event.current.num
  }
}

const handleBindingEvent = function(event) {
  // Toggle mark to exempt from shading
  if (event.binding?.command == exemptComStr) {
    let mark = sprintf(exemptMarkPat, fcsdWinId)
    i3.command(
      sprintf('[con_id=%s] mark --add --toggle %s', fcsdWinId, mark),
      (err, resp) => {}
    )
  }
}

const handleWindowEvent = async function(event) {
  fcsdWinId = event.container.id
  fcsdWinMarks = event.container.marks
  if (event.change == 'focus') {
    let float_val = event.container.floating
    // Tiled window focused
    if (['user_off', 'auto_off'].includes(float_val) ) {
      i3.tree((err, resp) => {
        //Get all the floating containers on the current workspace
        let fnodes = resp.
        nodes.find(_ => _.type == 'output' && _.name != '__i3').
        nodes.find(_ => _.type == 'con' && _.name == 'content').
        nodes.find(_ => _.type == 'workspace' && _.num == fcsdWsNum).
        floating_nodes.flatMap(_ => _.nodes);

        const isNormalOrUnknown = function(node) {
          return ["normal", "unknown"].includes(node.window_type)
        }
        // Test of window eligiblility (neither exempted nor already shaded)
        const isUnmarked = function(node) {
          return !node.marks.some( _ => 
            _.startsWith(markPref) || _.startsWith(exemptMarkPref)
          )
        }
        const isEligible = function(node) {
          return isNormalOrUnknown(node) && isUnmarked(node)
        }

        // Filter for eligble windows and loop through them.
        fnodes.filter(node => isEligible(node)).map(node => {
          let winHeight = node.rect.height + node.deco_rect.height - peekMargin
          let markCom = sprintf(
            '[con_id=%s] mark --add %s%d_%d_%s, move position %d px -%d px',
            node.id, markPref, node.rect.x, node.rect.y, node.id, node.rect.x, winHeight
          )
          i3.command(markCom, (err, resp) => {
            if (err) {
              console.error(err)
            }
          })
        })
      })
    }
    // Floating window focused
    else {
      let foccon = event.container
      let mark = foccon.marks.filter(mark => mark.startsWith(markPref) && !mark.startsWith(exemptMarkPref))[0]
      if (mark) {
        let toks = mark.split("_")
        i3.command(
          sprintf('unmark %s, move position %d px %d px', mark, toks[1], toks[2]-foccon.deco_rect.height),
          (err, resp) => {
            if (err) {
              console.error(err)
            }
          }
        )
      }
    }
  }
};

i3.on('workspace', handleWorkspaceEvent)
i3.on('window', handleWindowEvent);
i3.on('binding', handleBindingEvent)
