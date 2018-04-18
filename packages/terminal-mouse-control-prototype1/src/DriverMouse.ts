// with robot and terminal-kit move the mouse until the mouse enter the terminal window
import { EventEmitter } from 'events'
import { terminal } from 'terminal-kit'
import * as robot from 'robotjs'
import { Driver } from 'cli-driver'

/**
 * Adds mouse support to Driver. Usage example:
 *
 * see src/main1.ts to for usage
 */
export class DriverMouse extends Driver {

  constructor () {
    super()
  }

  /**
   * Forces the mouse to be in the terminal window so next we can start clicking inside it and dont loose focus in a X based system. Note that in the real command line (outside X) this is not necccesary, but probably mosue is not supported there.
   *
   * This implementaiton moves the mouse all over the desktop until it enters. After this we are ready to start emiting mouse events with terminalsemantics like cols, rows, etc.
   *
   * Usage example:
   *
   * ```js
   * console.log(await tm.mouseEnterTerminalWindow() ?
   *   'we have the mouse inside the terminal! :) ' :
   *   'we dont have the mouse inside the terminal'
   * )
   * ```
   *
   * @returns promise resolved with true in case we arcive that or false in case we don't.
   *
   *
   * TODO / or not TODO / we could enter Alt/tab with robot to see if now the terminal is on the front, but i think is too much
   */
  mouseEnterTerminalWindow (): Promise<boolean> {

    return new Promise(async (resolve) => {

      const moveMouse = async (x, y) => {
        robot.moveMouse(x, y)
        return this.waitTime(100)// we need an async breath here because tobot is sync and onwt let term-kit listeners execute
      }

      //  terminal kit part: listen when mouse enters terminal window and then resolve the promise
      terminal.grabInput({ mouse: 'motion' })
      terminal.on('mouse', function (name, data) {
        stopMovingMouse = true
        setTimeout(function () {
          terminal.grabInput(false)
          resolve(true)
        }, 100)
      })

      // robotjs part: starts moving the mouse allover the screen and after that reject the promise
      let stopMovingMouse = false
      robot.setMouseDelay(1) // Speed up the mouse.

      // first we try to move a little, perhaps we are already inside the terminal window
      const initialMousePos = robot.getMousePos()
      await moveMouse(initialMousePos.x + 5, initialMousePos.y + 5)

      await moveMouse(0,0)

      const screenSize = robot.getScreenSize()
      const height = screenSize.height
      const width = screenSize.width
      const hStep = height / 6 // TODO: magic number
      const wStep = width / 6 // TODO: magic number

      for (let y = hStep; y < height && !stopMovingMouse; y += hStep) {
        for (let x = 0; x < width && !stopMovingMouse; x += wStep) {
          await moveMouse(x, y)
        }
        // now go down one step and then we move to the left
        if (y < height - hStep) {
          y += hStep
          await moveMouse(width, y)
        }
        for (let x = width; x > 0 && !stopMovingMouse; x -= wStep) {
          await moveMouse(x, y)
        }
      }
      resolve(false)
    })

    // grabMouse(): Promise<void{
    // }

  }
}
