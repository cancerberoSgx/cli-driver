import { DriverMouse } from './DriverMouse'

async function main () {

  let tm = new DriverMouse()

  const focusTerminal = await tm.mouseEnterTerminalWindow()
  if (!focusTerminal) {
    console.log('Sorry we cannot focus your terminal windows now, perhaps is at the bottom / background or minimized now ? ')
    return
  } else {
    console.log('we are ready to start working with the mouse in the console!')
  }
}

main()
