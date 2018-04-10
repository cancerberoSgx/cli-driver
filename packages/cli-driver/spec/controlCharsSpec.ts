import { Driver, ansi } from '../src'
import * as shell from 'shelljs'

let data
const tab = '\u001B\u0009'
const EOL = '\u001B\u001A'
const path = require('path')

describe('control chars test', () => {

  xit('should be able to use bash autocomplete with tabs', async () => {
    const client = new Driver()
    if (client.systemIsWindows()) {
      return
    }
    await client.start({ notSilent: true })
    await client.enter('rm -rf tmp')
    await client.enter('mkdir -p tmp')
    await client.enter('cd tmp')
    await client.enter('echo "it is a trap" > trap1.txt'); await client.waitTime(300)

    const tab = '\u001B\u0009'
    // await client.enter('ls')
    await client.writeAndWaitForData('cat tra' + tab , 'cat trap1.txt')
    await client.enterAndWaitForData('', 'it is a trap')

    await client.enter('echo "it is a trap2" > trap2.txt')

    await client.write('cat tra' + tab + tab) // two tabs needed in the real life too!
    let data = await client.waitForData('trap1.txt')
    expect(data).toContain('trap2.txt')

    await client.writeAndWaitForData('2' + tab, 'cat trap2.txt')
    await client.enterAndWaitForData('', 'it is a trap2')
    await client.destroy()
  })

  it('should be able to use cat > file.txt to edit text in unix', async () => {
    const client = new Driver()
    if (client.systemIsWindows()) {
      return
    }
    await client.start({ notSilent: true })

    await client.enter('rm -rf tmp')
    await client.enter('mkdir -p tmp')
    await client.enter('cd tmp')

    await client.enter('cat > tmp/newFile.txt')

    await client.enter('These are some special notes')
    await client.enter('that take for myself')
    await client.enter('just to see if i can instrument cat')
    await client.write(EOL + EOL)
    data = await client.writeAndWaitForData('cat tmp/newFile.txt', 'These are some special notes')
    expect(data).toContain('just to see if i can instrument cat')

    await client.destroy()
  })

})

jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000

// import { Driver, ansi } from '../src'
// import * as shell from 'shelljs'

// async function enterAndWaitForData (client, enterString, dataContains) {
//   const data = await client.enterAndWaitForData(enterString, dataContains)
//   expect(data).toContain(dataContains)
//   return Promise.resolve(data)
// }
// async function writeAndWaitForData (client, enterString, dataContains) {
//   await client.write(enterString)
//   const data = await client.waitForData(dataContains)
//   expect(data).toContain(dataContains)
//   return Promise.resolve(data)
// }

// describe('control chars test', () => {

//   it('should be able to use bash autocomplete with tabs', async () => {
//     const client = new Driver()
//     if (client.systemIsWindows()) {
//       return
//     }
//     await client.start({ notSilent: true })
//     await client.enter('rm -rf tmp')
//     await client.enter('mkdir -p tmp')
//     await client.enter('cd tmp')
//     await client.enter('echo "it is a trap" > trap1.txt'); await client.waitTime(300)

//     const tab = '\u001B\u0009'
//     await client.enter('')
//     await writeAndWaitForData(client, 'cat tra' + tab , 'cat trap1.txt')
//     await enterAndWaitForData(client, '', 'it is a trap')

//     await client.enter('echo "it is a trap2" > trap2.txt')

//     await client.write('cat tra' + tab + tab) // two tabs needed in unit terminal
//     let data = await client.waitForData('trap1.txt')
//     expect(data).toContain('trap2.txt')

//     await writeAndWaitForData(client, '2' + tab, 'cat trap2.txt')
//     await enterAndWaitForData(client, '', 'it is a trap2')
//     await client.destroy()
//   })

//   // it('should be able to use ctrl-r to access bash history', async () => {
//   //   const client = new Driver()
//   //   if (client.systemIsWindows()) {
//   //     return
//   //   }
//   //   await client.start({ notSilent: true })
//   //   await client.destroy()
//   // })

//   // it('should be able to use cat > file.txt to edit text in unix', async () => {
//   //   const client = new Driver()
//   //   if (client.systemIsWindows()) {
//   //     return
//   //   }
//   //   await client.start({ notSilent: true })

//   //   await client.enter('rm -rf tmp')
//   //   await client.enter('mkdir -p tmp')
//   //   await client.enter('cd tmp')

//   //   await client.enter('cat > tmp/newFile.txt')

//   //   await client.enter('These are some special notes')
//   //   await client.enter('that take for myself')
//   //   await client.enter('just to see if i can instrument cat')
//   //   const EOL = '\u001B\u001A'
//   //   await client.write(EOL + EOL)
//   //   let data = await writeAndWaitForData(client, 'cat tmp/newFile.txt', 'These are some special notes')
//   //   expect(data).toContain('just to see if i can instrument cat')

//   //   await client.destroy()
//   // })
// })

// jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000

  // it('should be able to use bash autocomplete with tabs', async () => {
  //   const client = new Driver()
  //   if (client.systemIsWindows()) {
  //     return
  //   }

  //   const cwd = `${shell.pwd()}/tmp_${Date.now()}`
  //   shell.rm('-rf', cwd)
  //   shell.rm('-rf', 'tmp*')
  //   shell.rm('-rf', 'lib/spec/tmp*')
  //   shell.mkdir('-p', cwd)
  //   // // shell.cd(cwd)
  //   // await client.start({
  //   //   notSilent: true ,
  //   //   // debug: true,
  //   //   cwd: path.resolve(cwd),
  //   //   env: process.env
  //   // })
  //   // // await client.waitTime(300)
  //   // // await client.enter(`rm -rf tmp && mkdir -p tmp && cd tmp`); await client.waitTime(300)
  //   // // await client.enter(`mkdir -p tmp`)
  //   // // await client.enter(`cd tmp`)
  //   // await client.enter(`echo "it is a trap" > trap1.txt`)
  //   // await client.waitTime(300)

  //   // await  client.enter(`pwd`); await client.waitTime(300)
  //   // // await  client.enter(`rm -rf *`); await client.waitTime(300)
  //   // await  client.enter(`ls`); await client.waitTime(300)
  //   // // data = await client.waitForData(); await client.waitTime(300)
  //   // // await  client.enter(`ls`); await client.waitTime(300)
  //   // // console.log(`PWDD`, data)

  //   // client.enter('rm -rf *'); await client.waitTime(300)

  //   // await client.write(`cat tra` + tab)

  //   // await client.waitTime(300)
  //   // await client.write(tab)
  //   // await client.waitTime(300)
  //   // await client.write(tab)
  //   // await client.waitTime(300)

  //   // await client.waitForData(`trap1.txt`)

  //   // // await client.waitTime(300)

  //   // // await writeAndWaitForData(client, `cat tra` + tab, `cat trap1.txt`)
  //   // await client.waitTime(300)

  //   // await enterAndWaitForData(client, ` `, `it is a trap`)

  //   // // await client.waitTime(300)

  //   // // await client.enter(`echo "it is a trap2" > trap2.txt`)
  //   // // await client.waitTime(300)

  //   // // await client.write(`cat tra` + tab + tab)
  //   // // await client.waitTime(300)
  //   // // data = await client.waitForData(`trap1.txt`); await client.waitTime(300)

  //   // // expect(data).toContain(`trap2.txt`)

  //   // // await writeAndWaitForData(client, `2` + tab, `cat trap2.txt`); await client.waitTime(300)
  //   // // await enterAndWaitForData(client, ` `, `it is a trap2`); await client.waitTime(300)
  //   // await client.destroy()

  //   await client.start({
  //     notSilent: true,
  //     // debug: true,
  //     cwd: path.resolve(cwd),
  //     env: process.env
  //   })
  // // await client.waitTime(300)
  // // await client.enter(`rm -rf tmp && mkdir -p tmp && cd tmp`); await client.waitTime(300)
  // // await client.enter(`mkdir -p tmp`)
  // // await client.enter(`cd tmp`)
  //   await enterAndWaitForData(client, `echo "it is a trap" > trap1.txt && echo "end1"`, `end1`)
  // // await client.enter(`echo "it is a trap" > trap1.txt && echo "end1"`);
  // // await client.waitTime(300);

  //   await enterAndWaitForData(client, `pwd &&  echo "end2"`, `end2`)
  // // await client.enter(`pwd &&  && echo "end2"`);
  // // await client.waitTime(300);
  // // await  client.enter(`rm -rf *`); await client.waitTime(300)

  //   await enterAndWaitForData(client, `ls &&  echo "end3"`, `end3`)
  // // await client.waitTime(300);
  // // data = await client.waitForData(); await client.waitTime(300)
  // // await  client.enter(`ls`); await client.waitTime(300)
  // // console.log(`PWDD`, data)
  // // client.enter('rm -rf *');

  //   await enterAndWaitForData(client, 'rm -rf * &&  echo "end4"', `end4`)
  // // await client.waitTime(300);

  //   await client.write(`cat tra` + tab);
  //   await client.waitTime(300);
  //   await client.write(tab);
  //   await client.waitTime(300)
  // // await client.write(tab);
  // // await client.waitTime(300);
  //   await client.waitForData(`trap1.txt`)
  // // await client.waitTime(300)
  //   // await writeAndWaitForData(client, `cat tra` + tab, `trap1.txt`)
  // // await client.waitTime(300);
  //   await enterAndWaitForData(client, ``, `it is a trap`)
  // // await client.waitTime(300)
  // // await client.enter(`echo "it is a trap2" > trap2.txt`)
  // // await client.waitTime(300)
  // // await client.write(`cat tra` + tab + tab)
  // // await client.waitTime(300)
  // // data = await client.waitForData(`trap1.txt`); await client.waitTime(300)
  // // expect(data).toContain(`trap2.txt`)
  // // await writeAndWaitForData(client, `2` + tab, `cat trap2.txt`); await client.waitTime(300)
  // // await enterAndWaitForData(client, ` `, `it is a trap2`); await client.waitTime(300)
  //   await client.destroy()
  // })

  // it('should be able to use ctrl-r to access bash history', async () => {
  //   const client = new Driver()
  //   if (client.systemIsWindows()) {
  //     return
  //   }
  //   await client.start({ notSilent: true })
  //   await client.destroy()
  // })

  // async function enterAndWaitForData (client, enterString, dataContains) {
//   const data = await client.enterAndWaitForData(enterString, dataContains)
//   expect(data).toContain(dataContains)
//   return Promise.resolve(data)
// }
// async function writeAndWaitForData (client, enterString, dataContains) {
//   await client.write(enterString)
//   const data = await client.waitForData(dataContains)
//   expect(data).toContain(dataContains)
//   return Promise.resolve(data)
// }

// async function enterAndWaitForData (client, enterString, dataContains) {
//   const data = await client.enterAndWaitForData(enterString, dataContains)
//   expect(data).toContain(dataContains)
//   return data
// }
// async function writeAndWaitForData (client:Driver, enterString, dataContains) {
//   const data = await client.enterAndWaitForData(enterString, dataContains)
//   expect(data).toContain(dataContains)
//   return data
// }
