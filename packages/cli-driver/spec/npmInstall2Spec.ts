// import { Driver } from '../src'
// import * as shell from 'shelljs'
// import { writeFileSync } from 'fs'
// import { DriverError } from '../src/interfaces'

// describe('basics', () => {

//   jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
//   it('npm install cli-driver should work', async (done) => {

//     // we want to work outside this workspace because of lerna
//     const root = process.env.HOME
//     shell.rm('-rf', `${root}/tmp_npminstall_*`)
//     const project = `${root}/tmp_npminstall_${Date.now()}`

//     const client = new Driver()
//     await client.start({
//       notSilent: true,
//       cwd: process.env.HOME,
//       waitUntilTimeoutHandler: (error) => {
//         if (error && error.type === Driver.ERROR_TYPE) {
//           expect(error.code + ': ' + error.description).toBeUndefined()
//         }
//       },
//       waitUntilSuccessHandler: (predicate, data) => {
//         console.log('Predicate Matched !: ' + Driver.printWaitUntilPredicate(predicate))
//       }
//     })
//     await client.enter(`mkdir ${project}; cd ${project}; npm init -y; npm install --save cli-driver ; npm install --save-dev typescript --offline --verbose`)

//     let data = await client.waitForData({
//       predicate: '[ 0, true ]', // printed by las npm install --verbose
//       timeout: 17000,
//       rejectOnTimeout: false
//     })
//     console.log('FIRST PROMISE: ', data)
//     // expect(data && (data as DriverError).code).not.toBe(Driver.ERROR_TYPE)

//     // await client.waitTime(1000)

//     shell.mkdir('-p', `${project}/src`)
//     writeFileSync(`${project}/src/index.ts`, index_ts)
//     writeFileSync(`${project}/tsconfig.json`, tsconfig_json)

//     await client.enter('node node_modules/typescript/bin/tsc ; node lib/index.js')

//     data = await client.waitForData({
//       predicate: 'npminstalltest child program finished',
//       timeout: 10000 ,
//       rejectOnTimeout: false
//     })
//     expect(data && (data as DriverError).code).not.toBe(Driver.ERROR_TYPE)
//     expect(data).toContain('cli-driver works!')

//     shell.rm('-rf', `${root}/tmp_npminstall_*`)
//     await client.destroy()
//     done()
//   })

// })

// const index_ts = `
// import { Driver } from 'cli-driver'
// import { existsSync, readFileSync } from 'fs'
// (async () => {
//   const client = new Driver()
//   await client.start({ notSilent: true })
//   await client.enter('echo "hello from user" > tmp_from_user.txt')
//   await client.waitUntil(() => existsSync('tmp_from_user.txt'), 2000)
//   const isOk = readFileSync('tmp_from_user.txt').toString().includes('hello from user')
//   if (isOk) {
//     console.log('cli-driver works!')
//   } else {
//     console.log(':( cli-driver dont  work :(')
//   }
//   console.log('npminstalltest child program finished')
//   await client.destroy()
// })()
// `

// const tsconfig_json = `
// {
//     "compilerOptions": {
//         "target": "es2018",
//         "module": "commonjs",
//         "lib": [
//             "es2016",
//             "dom"
//         ],
//         "outDir": "lib"
//     },
//     "include": [
//         "src/**/*.ts"
//     ]
// }
// `
