// import { Driver } from '../src'
// import * as shell from 'shelljs'
// import { writeFileSync } from 'fs'
// import { DriverError } from '../src/interfaces'

// describe('basics', () => {

//   jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
//   it('npm install cli-driver should work', async (done) => {

//     // we want to work outside this workspace because of lerna
//     const root = process.env.HOME
//     shell.rm('-rf', `${root}/tmp_npminstall_*`)
//     const project = `${root}/tmp_npminstall_${Date.now()}`

//     const client = new Driver()
//     await client.start({
//       notSilent: true,
//       cwd: process.env.HOME,
//       waitUntilTimeoutHandler: async (error) => {

//         writeFileSync(`${project}/log_all_data1.txt`, JSON.stringify({ data: await client.getAllData() }, null, 2))
//         console.log('waitUntilTimeoutHandlerwaitUntilTimeoutHandlerwaitUntilTimeoutHandlerwaitUntilTimeoutHandlerwaitUntilTimeoutHandlerwaitUntilTimeoutHandlerwaitUntilTimeoutHandlerwaitUntilTimeoutHandlerwaitUntilTimeoutHandlerwaitUntilTimeoutHandler*************************************')
//         if (error && error.type === Driver.ERROR_TYPE) {
//           expect(error.code + ': ' + error.description).toBeUndefined()
//         }
//       },
//       waitUntilSuccessHandler: async (data, predicate) => {
//         console.log('waitUntilSuccessHandlerwaitUntilSuccessHandlerwaitUntilSuccessHandlerwaitUntilSuccessHandlerwaitUntilSuccessHandler*************************************')
//         console.log('Predicate Matched !: ' + Driver.printWaitUntilPredicate(predicate))
//       }
//     })
//     const command = `mkdir ${project}; cd ${project}; npm init -y; npm install --save cli-driver; npm install --save-dev --offline --verbose typescript `
//     console.log('COMMAND: ' + command)
//     await client.enter(command)

//     let data = await client.waitForData({
//       predicate: async () => {
//         const allData = await client.getAllData(); 
//         const result = allData.includes('[ 0, true ]'); 
//         console.log('RESULT*****', result); 
//         return result
//       }, // printed by las npm install --verbose
//       timeout: 40000,
//       interval: 1000,
//       rejectOnTimeout: false
//     })

//     // await client.waitTime(1000)

//     shell.mkdir('-p', `${project}/src`)
//     writeFileSync(`${project}/src/index.ts`, index_ts)
//     writeFileSync(`${project}/tsconfig.json`, tsconfig_json)

//     await client.enter('node node_modules/typescript/bin/tsc ; node lib/index.js')

//     console.log('reading ' + `${project}/tmp_from_user.txt`)
//     client.waitForData({
//       predicate: 'test index.js finish executing',// shell.test('-f', `${project}/tmp_from_user.txt`) && shell.cat(`${project}/tmp_from_user.txt`).toString().includes('hello from user'),
//       timeout: 40000 ,
//       rejectOnTimeout: false
//     }).then((data) => {
//       expect((data as DriverError).code + ': ' + (data as DriverError).description).toBeUndefined()
//       expect(data).toContain('cli-driver works!')
//     })

//     // shell.rm('-rf', `${root}/tmp_npminstall_*`)
//     // await client.waitTime(1000)
//     writeFileSync(`${project}/log_all_data2.txt`, JSON.stringify({ data: await client.getAllData() }, null, 2))
//     await client.destroy()

//     console.log('PROJECT AT: ' + project)
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
//   }y
//   await client.enter('echo "test index.js finish executing")
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
