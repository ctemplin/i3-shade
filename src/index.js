#!/usr/bin/env node

const i3 = require('i3').createClient();
const util = require('util')

const exemptComStr = "nop i3-shade-exempt"
const markPref = "shade_"
const exemptMarkPref = "_shade_exempt_"
const exemptMarkPat = exemptMarkPref + "%s"
const peekMargin = 2;
var fcsdWsNum, fcsdWinId, fcsdWinMarks;

// Get the initial focused WS num
i3.workspaces((err, json) => {
  fcsdWsNum = json.find(ws => ws.focused).num
})

const handleWorkspaceEvent = function() {
  if (arguments[0].change == "focus") {
    fcsdWsNum = arguments[0].current.num
  }
}

const handleBindingEvent = function() {
  // Toggle mark to exempt from shading
  if (arguments[0]?.binding?.command == exemptComStr) {
    let mark = util.format(exemptMarkPat, fcsdWinId)
    i3.command(
      util.format('[con_id=%s] mark --add --toggle %s', fcsdWinId, mark),
      (err, resp) => {}
    )
  }
}

const handleWindowEvent = async function() {
  fcsdWinId = arguments[0].container.id
  fcsdWinMarks = arguments[0].container.marks
  if (arguments[0].change == 'focus') {
    let float_val = arguments[0].container.floating
    // Tiled window focused
    if (['user_off', 'auto_off'].includes(float_val) ) {
      i3.tree((err, resp) => {
        //Get all the floating containers on the current workspace
        let fnodes = resp.
        nodes.find(_ => _.type == 'output' && _.name != '__i3').
        nodes.find(_ => _.type == 'con' && _.name == 'content').
        nodes.find(_ => _.type == 'workspace' && _.num == fcsdWsNum).
        floating_nodes.flatMap(_ => _.nodes);
        // Test of window eligiblility (neither exempted nor already shaded)
        const isUnmarked = function(node) {
          return !node.marks.some( _ => 
            _.startsWith(markPref) || _.startsWith(exemptMarkPref)
          )
        }
        // Filter for eligble windows and loop through them.
        fnodes.filter(node => isUnmarked(node)).map(node => {
          console.log('loop', fcsdWsNum, Date())
          let winHeight = node.rect.height + node.deco_rect.height - peekMargin
          let markCom = util.format(
            '[con_id=%s] mark --add %s%d_%d_%s, move position %d px -%d px',
            node.id, markPref, node.rect.x, node.rect.y, node.id, node.rect.x, winHeight
          )
          i3.command(markCom, (err, resp) => {
            // console.log(err, resp)
          })
        })
      })
    }
    // Floating window focused
    else {
      let foccon = arguments[0].container
      let mark = foccon.marks.filter(mark => mark.startsWith(markPref) && !mark.startsWith(exemptMarkPref))[0]
      if (mark) {
        let toks = mark.split("_")
        i3.command(
          util.format('unmark %s, move position %d px %d px', mark, toks[1], toks[2]-foccon.deco_rect.height),
          (err, resp) => {}
        )
      }
    }
  }
};

i3.on('workspace', handleWorkspaceEvent)
i3.on('window', handleWindowEvent);
i3.on('binding', handleBindingEvent)
