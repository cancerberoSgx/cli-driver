import { Driver } from '../src'
import { createReadStream } from 'fs'
import { Socket } from 'net'

async function main () {
  console.log('lasjdlkajsldk')

  const client = new Driver()

  await client.start({ notSilent: true })

  const EOL = '\u001B\u001A'

  await client.write('\033c')

  await client.destroy()

}

main()
