const sprintf = require('sprintf-js').sprintf

class Shade {

  constructor(markPref, exemptMarkPref, socketPath, exemptComStr) {
    this.markPref = markPref
    this.exemptMarkPref = exemptMarkPref
    this.socketPath = socketPath
    this.exemptComStr = exemptComStr

    this.exemptMarkPat = exemptMarkPref + "%s"
    this.peekMargin = 2;
    this.fcsdWsNum
    this.fcsdWinId
    this.fcsdWinMarks

    this.i3 = null
    this.handlersSet = false
  }

  connect = function() {
    this.i3 = require('i3').createClient({path: this.socketPath}, () => {})

    // Get the initial focused WS num
    this.i3.workspaces((err, json) => {
      this.fcsdWsNum = json.find(ws => ws.focused).num
    })

    this.i3.on('workspace', this.handleWorkspaceEvent.bind(this))
    this.i3.on('binding', this.handleBindingEvent.bind(this))
    this.i3.on('window', this.handleWindowEvent.bind(this))
  }

  handleWorkspaceEvent = function(event) {
    if (event && event.change == "focus") {
      this.fcsdWsNum = event.current.num
    }
  }

  handleBindingEvent = function(event) {
    // Toggle mark to exempt from shading
    if (event.binding?.command == this.exemptComStr) {
      let mark = sprintf(this.exemptMarkPat, this.fcsdWinId)
      this.i3.command(
        sprintf('[con_id=%s] mark --add --toggle %s', this.fcsdWinId, mark),
        (err, resp) => {}
      )
    }
  }

  handleWindowEvent = async function(event) {
    this.fcsdWinId = event.container.id
    this.fcsdWinMarks = event.container.marks
    if (event.change == 'focus') {
      let float_val = event.container.floating
      // Tiled window focused
      if (['user_off', 'auto_off'].includes(float_val) ) {
        this.i3.tree((err, resp) => {
          //Get all the floating containers on the current workspace
          let fnodes = resp.
          nodes.find(_ => _.type == 'output' && _.name != '__i3').
          nodes.find(_ => _.type == 'con' && _.name == 'content').
          nodes.find(_ => _.type == 'workspace' && _.num == this.fcsdWsNum).
          floating_nodes.flatMap(_ => _.nodes);

          const isNormalOrUnknown = function(node) {
            return ["normal", "unknown"].includes(node.window_type)
          }
          // Test of window eligiblility (neither exempted nor already shaded)
          const isUnmarked = function(node) {
            return !node.marks.some( _ =>
              _.startsWith(this.markPref) || _.startsWith(this.exemptMarkPref)
            )
          }.bind(this)
          const isEligible = function(node) {
            return isNormalOrUnknown(node) && isUnmarked(node)
          }

          // Filter for eligble windows and loop through them.
          fnodes.filter(node => isEligible(node)).map(node => {
            let winHeight = node.rect.height + node.deco_rect.height - this.peekMargin
            let markCom = sprintf(
              '[con_id=%s] mark --add %s%d_%d_%s, move position %d px -%d px',
              node.id, this.markPref, node.rect.x, node.rect.y, node.id, node.rect.x, winHeight
            )
            this.i3.command(markCom, (err, resp) => {
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
        let mark = foccon.marks.filter(mark => mark.startsWith(this.markPref) && !mark.startsWith(this.exemptMarkPref))[0]
        if (mark) {
          let toks = mark.split("_")
          this.i3.command(
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
  }
}

module.exports = Shade