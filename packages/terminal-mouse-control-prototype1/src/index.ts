// with robot and terminal-kit move the mouse until the mouse enter the terminal window
import { EventEmitter } from 'events'
import { terminal } from 'terminal-kit'
import * as robot from 'robotjs'
import {Driver} from 'cli-driver'


export class TerminalMouse extends Driver {

  // driver: Driver;
  constructor(){
    super()
    // this.driver = new Driver()    
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
   */
   mouseEnterTerminalWindow (): Promise<boolean> {

    return new Promise(async(resolve)=>{
      //  terminal kit part: listen when mouse enters terminal window and then resolve the promise
      terminal.grabInput({ mouse: 'motion' })
      terminal.on('mouse', function (name, data) {
        stopMovingMouse=true
        terminal.grabInput(false)
        setTimeout(function () {
          resolve(true)
        }, 100)
      })

      // robotjs part: starts moving the mouse allover the screen and after that reject the promise
      let stopMovingMouse = false
      robot.setMouseDelay(1) // Speed up the mouse.

      // first we try to move a little, perhaps we are already inside the terminal window
      const initialMousePos =robot.getMousePos()
      const screenSize = robot.getScreenSize()
      const height = screenSize.height
      const width = screenSize.width
      const hStep = height / 6 // TODO: magic number
      const wStep = width / 6 // TODO: magic number
      for (var y = hStep; y < height && !stopMovingMouse; y += hStep) {
        for (let x = 0; x < width && !stopMovingMouse; x += wStep) {
          // we need an async breath here because tobot is sync and onwt let term-kit listeners execute
          await this.waitTime(10)
          resolve()
          robot.moveMouse(x, y)
        }
        // now go down one step and we move to the left
        if (y < height - hStep) {
          y += hStep
        }
        for (let x = height; x >0 && !stopMovingMouse; x -= wStep) {
          // again, we need to be async
          await this.waitTime(10)
          resolve()

          robot.moveMouse(x, y)
        }
      }
      resolve(false)
    })

    // grabMouse(): Promise<void{
    // }

    
  }
}

