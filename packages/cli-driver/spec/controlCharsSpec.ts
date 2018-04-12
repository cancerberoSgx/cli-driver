import { Driver, ansi } from '../src'
import * as shell from 'shelljs'
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000
let data
const path = require('path')

describe('control chars test', () => {

  it('should be able to use bash autocomplete with tabs', async (done) => {

    if (Driver.systemIsWindows()) {
      pending('test too advanced for windows systems')
    }
    const client = new Driver()

    await client.start({
      notSilent: true,
      cwd: shell.pwd().toString()
    })

    const TAB = '\u001B\u0009'
    const project = `tmp_` + Date.now()
    await client.enter(`rm -rf ${project}`)
    await client.enter(`mkdir ${project}`)
    await client.enter(`cd ${project}`)

    await client.waitTime(100)
    await client.enter(`echo "it is a trap" > trap1.txt`)

    data = await client.waitUntil(() => shell.test(`-f`, `${project}/trap1.txt`))
    expect(shell.cat(`${project}/trap1.txt`)).toContain(`it is a trap`)

    await client.writeAndWaitForData(`cat tra` + TAB , `trap1.txt`) // unix should autocomplete cause is the only file
    await client.enterAndWaitForData(``, `it is a trap`)

    await client.enter(`echo 'it is a trap2' > trap2.txt`)

    // now we have two files with the same prefix. two tabs will print both
    await client.write(`cat tra` + TAB + TAB)
    data = await client.waitForData(`trap1.txt`)
    expect(data).toContain(`trap2.txt`)

    await client.writeAndWaitForData(`2` + TAB, `cat trap2.txt`)
    await client.enterAndWaitForData(``, `it is a trap2`)
    await client.enter(`rm -rf ${project}`)
    await client.enter(`exit`)
    await client.destroy()
    done()
  })

  it('should be able to use cat > file.txt to edit text in unix', async (done) => {

    if (Driver.systemIsWindows()) {
      pending('test too advanced for windows systems')
    }
    const client = new Driver()
    await client.start({ notSilent: true })

    const project = `tmp_` + Date.now()
    const EOF = '\u001B\u0026'

    await client.enter(`rm -rf ${project} && mkdir -p ${project} && cd ${project}`)
    await client.enter('cat > newFile.txt')
    await client.enter(`These are some special notes`)
    await client.enter(`that take for myself`)
    await client.enter(`just to see if i can instrument cat`)
    await client.write(EOF)
    data = await client.enterAndWaitForData(`cat newFile.txt`, `These are some special notes`)
    expect(data).toContain(`just to see if i can instrument cat`)

    await client.enter(`exit`)
    await client.destroy()
    done()
  })

})
