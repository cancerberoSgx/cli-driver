// Be able to run individual specs (without having to comment all the others). Examples:
//
// $ node spec cliApiSpec
// $ node spec cliApiSpec,nodeApiSpec

const path = require('path')
const Jasmine = require('jasmine')

let specFiles = process.argv[2].split(',').map(f => path.join(__dirname, f))

const jasmineRunner = new Jasmine()
jasmineRunner.specFiles = specFiles
jasmineRunner.execute()

/// idea de un proyecto futuro

// /*

// TODO move this to its own project - minimist jasmine, and jasmine-serial dependencies can then be removed

// Be able to run individual specs (without having to comment all the others). Examples:

// # execute just one spec
// $ node spec cliApiSpec
// # execute a couple
// $ node spec cliApiSpec nodeApiSpec
// # execute a couple of expect with jasmine-serial and a custom reporter
// $ node spec --serial --reporter=jasmine-ts-console-reporter cliApiSpec nodeApiSpec

// */

// const path = require('path')

// let args = require('minimist')(process.argv.slice(2))
// // console.log(args)
// const useSerialJasmine = process.argv.find(a => a.includes('--serial'))
// let specFiles = args._
// .map(f => path.join(__dirname, f))

// if (useSerialJasmine) {
// // execute serial-jasmine:

//   const sj = require('serial-jasmine')
//   // let taskFiles = ['./test/foo.spec.js','./test/bar.spec.js']
//   sj.runTasks(specFiles,null,true,true,false)
// .then((results) => {
//     // Do what you want with data
//   console.log('results', results)

// })
// .catch((err) => console.log(err))
// } else {

//   const Jasmine = require('jasmine')

//   const jasmineRunner = new Jasmine()

//   jasmineRunner.specFiles = specFiles
//   jasmineRunner.execute()

// }
