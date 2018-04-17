// with robot and terminal-kit move the mouse until the mouse enter the terminal window
import { EventEmitter } from 'events'
import {terminal} from 'terminal-kit'
import * as robot from 'robotjs'


// tools to force the mouse inside a terminal (when you are on X)
// emit events in the context of a terminal(cols/rows) when mouse changes
// programatically control the mosue (thanks to robotjs)
export class TerminalMouse extends EventEmitter {
  makeMouseEnterTerminal () {

    // robotjs part
    robot.setMouseDelay(2)  // Speed up the mouse.
    var screenSize = robot.getScreenSize()
    var height = screenSize.height// / 2 - 10
    var width = screenSize.width
    const hInterval = height / 10
    const wInterval = width / 10

    for (var y = hInterval; y < height; y+=hInterval) {
      for (let x = 0; x < wInterval; x+=wInterval) {
        robot.moveMouse(x, y)
      }
    }





    function terminate () {
      terminal.grabInput(false)
      setTimeout(function () {
        process.exit()
      }, 100)
    }



    terminal.bold.cyan('Type anything on the keyboard...\n')
    terminal.green('Hit CTRL-C to quit.\n\n')

    terminal.grabInput({ mouse: 'button' })

    terminal.on('key', function (name, matches, data) {
      console.log("'key' event:", name)
      if (name === 'CTRL_C') {
        terminate()
      }
    })

    terminal.on('terminal', function (name, data) {
      console.log("'terminal' event:", name, data)
    })

    terminal.on('mouse', function (name, data) {
      console.log("'mouse' event:", name, data)
    })
  }
}
