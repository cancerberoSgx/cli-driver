import { DriverMouse } from './DriverMouse'

async function main () {

  let client = new DriverMouse()

  await client.mouseStart()

  const focusTerminal = await client.mouseEnterTerminalWindow()
  if (!focusTerminal) {
    console.log('Sorry we cannot focus your terminal windows now, perhaps is at the bottom / background or minimized now ? ')
    return
  } else {
    console.log('we are ready to start working with the mouse in the console!')
  }

  console.log('COORD 00 == ', await client.guess00())

  await client.mouseStop()
}

main()
