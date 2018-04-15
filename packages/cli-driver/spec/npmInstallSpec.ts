import { Driver } from '../src'
import * as shell from 'shelljs'
import { writeFileSync } from 'fs'
import { DriverError } from '../src/interfaces'

function checkError (data, msg) {
  if (data.type === Driver.ERROR_TYPE) {
    fail(`In ${msg} , an error was returned by Driver:   Code: ${data.code}  - description: ${data.description}`)
  }
}

describe('basics', () => {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
  let data
  it('npm install cli-driver should work', async (done) => {

    // we want to work outside this workspace because of lerna
    const root = process.env.HOME
    shell.rm('-rf', `${root}/tmp_npminstall_*`)
    const project = `${root}/tmp_npminstall_${Date.now()}`

    const client = new Driver()
    await client.start({
      notSilent: true,
      cwd: process.env.HOME,
      waitUntilRejectOnTimeout: false,
      waitUntilTimeoutHandler: (error, predicate) => {
        expect(`Timeout error with predicate '${Driver.printWaitUntilPredicate(predicate)}'`).toBe(undefined)
      }

    })
    const command = `mkdir ${project}; cd ${project}; npm init -y; npm install --save cli-driver; npm install --save-dev --offline --verbose typescript; node -p "'hello_'+(33+1)+'_world'"`

    console.log('COMMAND: ' + command)

    await client.enter(command, 1000)

    data = await client.waitForData({
      predicate: 'hello_34_world',
      timeout: 40000,
      interval: 1000,
      rejectOnTimeout: false
    })
    checkError(data, 'the first npm install of cli-driver and typescript')

    shell.mkdir('-p', `${project}/src`)
    writeFileSync(`${project}/src/index.ts`, indexTs)
    writeFileSync(`${project}/tsconfig.json`, tsconfigJson)

    await client.enter('node node_modules/typescript/bin/tsc ; node lib/index.js')

    console.log('reading ' + `${project}/tmp_from_user.txt`)
    data = await client.waitForData({
      predicate: 'test index.js finish executing',
      timeout: 40000 ,
      rejectOnTimeout: false
    })

    checkError(data, 'tsc and index.js finish executing')
    expect(data).toContain('cli-driver works!')

    expect(await client.getAllData()).not.toContain('error TS')

    shell.rm('-rf', `${root}/tmp_npminstall_*`)

    // writeFileSync(`${project}/log_all_data2.txt`, JSON.stringify({ data: await client.getAllData() }, null, 2))
    await client.destroy()

    console.log('PROJECT AT: ' + project)
    done()
  })

})

const indexTs = `
import { Driver } from 'cli-driver'
import { existsSync, readFileSync } from 'fs'
(async () => {
  const client = new Driver()
  await client.start({ notSilent: true })
  await client.enter('echo "hello from user" > tmp_from_user.txt')
  await client.waitUntil(() => existsSync('tmp_from_user.txt'), 2000)
  const isOk = readFileSync('tmp_from_user.txt').toString().includes('hello from user')
  if (isOk) {
    console.log('cli-driver works!')
  } else {
    console.log(':( cli-driver dont  work :(')
  }
  await client.enter('echo "test index.js finish executing')
  await client.destroy()
})()
`

const tsconfigJson = `
{
    "compilerOptions": {
        "target": "es2018",
        "module": "commonjs",
        "lib": [
            "es2016",
            "dom"
        ],
        "outDir": "lib"
    },
    "include": [
        "src/**/*.ts"
    ]
}
`
