import { TerminalMouse } from './index'

async function main () {
  let tm = new TerminalMouse()
  console.log(await tm.mouseEnterTerminalWindow() ?
    'we have the mouse inside the terminal! :) ' :
    'we dont have the mouse inside the terminal'
  )
}

main()
