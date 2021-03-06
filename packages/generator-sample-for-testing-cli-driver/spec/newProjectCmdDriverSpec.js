const Driver = require('cli-driver').Driver
const ansi = require('cli-driver').ansi
const shell = require('shelljs')
const path = require('path')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 80000

describe('integration test making sure it works in the real command line', ( ) => {
  it('execute yo sample-for-testing-cli-driver (using current project) should generate the correct project', async () => {


    let sampleProject = path.join('tmp', 'sample1')

    shell.rm('-rf', sampleProject)
    shell.mkdir('-p', sampleProject)
    sampleProject = path.resolve(sampleProject)

    const pwd = shell.pwd()
    shell.cd(sampleProject)
    expect(shell.exec('npm init -y').code).toBe(0)
    expect(shell.test('-f', `package.json`)).toBe(true)
    expect(shell.exec(`npm install yo ${pwd} --offline`).code).toBe(0)

    let cwd = path.join(sampleProject, 'test-project1')
    shell.rm('-rf', cwd)
    shell.mkdir('-p', cwd)

    const client = new Driver()
    await client.start({
      cwd, 
      notSilent: true,
      waitUntilRejectOnTimeout: false,
      waitUntilTimeoutHandler: (error, predicate) => {
        expect(`Timeout error with predicate '${Driver.printWaitUntilPredicate(predicate)}'`).toBe(undefined)
      },
      // waitAfterWrite: 800
      
    })
    await client.enter(`node ../node_modules/yo/lib/cli.js --no-insight ../node_modules/generator-sample-for-testing-cli-driver/generators/app/`)

    await client.waitForData('Select Project Type')

    console.log('down')
    await client.write(ansi.cursor.down())
    await client.write(ansi.cursor.down())
    await client.write(ansi.cursor.up())
    await client.enter('')

    await client.waitForDataAndEnter('Enter a project name', 'my-cool-project123')
    await client.waitForDataAndEnter('Project description', 'my-cool-description 123123')
    await client.waitForDataAndEnter('Include sample objects and scripts', '')
    await client.waitForDataAndEnter('Include developer tools', '')
    await client.waitForDataAndEnter('What language do you prefer', '')
    await client.waitForData('tsconfig.json')
    await client.destroy()

    expect(shell.cat(`${cwd}/package.json`)).toContain(`"name": "my-cool-project123",`)
    expect(shell.cat(`${cwd}/README.md`)).toContain(`my-cool-description 123123`)
    expect(shell.cat(`${cwd}/src/sample123/entrypoint.ts`)).toContain(`export class Apple`)

    await client.destroy()
    shell.cd(pwd)
    shell.rm('-rf', sampleProject)
   
  })
})
