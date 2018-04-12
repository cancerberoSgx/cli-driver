import { Driver } from '../src'
import { createReadStream } from 'fs'
import { Socket } from 'net'

async function main () {
  console.log('lasjdlkajsldk')

  const client = new Driver()

  await client.start({ notSilent: true })

  const EOL = '\u001B\u001A'

  await client.write(`cat > letter_to_santa.txt \r

  dear santa Im sorry for my very very long letter:
  for this...
  I want : ...
  ....

  ${EOL}${EOL}
  `)

  await client.destroy()

}

main()
