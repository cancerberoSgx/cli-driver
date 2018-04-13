import { Driver } from '../src'
import * as shell from 'shelljs'
import { writeFileSync } from 'fs'

describe('basics', () => {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000
  it('npm install cli-driver should work', async (done) => {

    shell.rm('-rf', 'tmp_npminstall_*')
    const project = `tmp_npminstall_${Date.now()}`

    const client = new Driver()
    await client.start({
      notSilent: true,
      cwd: shell.pwd().toString()
    })
    await client.enter(`mkdir ${project}; cd ${project}; npm init -y; npm install --save cli-driver ; npm install --save-dev typescript --offline --verbose`)

    let data = await client.waitForData('[ 0, true ]', 60000) // printed by las npm install --verbose

    await client.waitTime(1000)

    shell.mkdir('-p', `${project}/src`)
    writeFileSync(`${project}/src/index.ts`, index_ts)
    writeFileSync(`${project}/tsconfig.json`, tsconfig_json)

    await client.enter('node node_modules/typescript/bin/tsc ; node lib/index.js')
    data = await client.waitForData('npminstalltest child program finished', 10000)
    expect(data).toContain('cli-driver works!')

    shell.rm('-rf', 'tmp_npminstall_*')
    await client.destroy()
    done()
  })

})

const index_ts = `
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
  console.log('npminstalltest child program finished')
  await client.destroy()
})()
`

const tsconfig_json = `
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
