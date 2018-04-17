// with robot and terminal-kit move the mouse until the mouse enter the terminal window

import { EventEmitter } from 'events'

var term = require('terminal-kit').terminal

// Move the mouse across the screen as a sine wave.
var robot = require('robotjs')

// tools to force the mouse inside a terminal (when you are on X)
// emit events in the context of a terminal(cols/rows) when mouse changes
// programatically control the mosue (thanks to robotjs)
class TerminalMouse extends EventEmitter {
  makeMouseEnterTerminal () {
  

    // robotjs part

    robot.setMouseDelay(2)  // Speed up the mouse.
    var screenSize = robot.getScreenSize()
    var height = screenSize.height / 2 - 10
    var width = screenSize.width

    const hInterval = height / 10
    const wInterval = width / 10

    for (var y = hInterval; x < width; x++) {
      y = height * Math.sin(twoPI * x / width) + height
      robot.moveMouse(x, y)
    }

    function terminate () {
      term.grabInput(false)
      setTimeout(function () {
        process.exit()
      }, 100)
    }



    term.bold.cyan('Type anything on the keyboard...\n')
    term.green('Hit CTRL-C to quit.\n\n')

    term.grabInput({ mouse: 'button' })

    term.on('key', function (name, matches, data) {
      console.log("'key' event:", name)
      if (name === 'CTRL_C') {
        terminate()
      }
    })

    term.on('terminal', function (name, data) {
      console.log("'terminal' event:", name, data)
    })

    term.on('mouse', function (name, data) {
      console.log("'mouse' event:", name, data)
    })
  }
}
