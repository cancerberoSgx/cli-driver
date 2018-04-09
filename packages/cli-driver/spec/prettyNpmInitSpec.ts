import { Driver } from '../src/index'
import * as path from 'path'
import * as shell from 'shelljs'

describe('automating npm init command', () => {
  it('npm init should create a package.json with filled information', async () => {
    const projectPath = path.join('tmp', 'my-cool-npm-project')
    shell.rm('-rf', projectPath)
    shell.mkdir('-p', projectPath)

    const client = new Driver()
    await client.start({
      cwd: projectPath
    })
    await client.enter('npm init')

    // will wait until stdout prints 'package name:' and then enter the project name 'changed-my-mind-project'
    await client.waitForDataAndEnter('package name:', 'changed-my-mind-project')
    await client.waitForDataAndEnter('version:', '') // just press enter to use default version (1.0.0)
    await client.waitForDataAndEnter('description:', 'cool description')

    await client.waitForDataAndEnter('entry point:', 'src/index.js')
    await client.waitForDataAndEnter('test command:', 'jasmine')
    await client.waitForDataAndEnter('git repository:', '')
    await client.waitForDataAndEnter('keywords:', '')
    await client.waitForDataAndEnter('author:', '')
    await client.waitForDataAndEnter('license:', '')
    await client.waitForDataAndEnter('Is this ok?', '')

    await client.wait(300) // give npm some time to write the file

    const packageJson = JSON.parse(shell.cat(`${projectPath}/package.json`))
    expect(packageJson.name).toBe('changed-my-mind-project')
    expect(packageJson.version).toBe('1.0.0')
    expect(packageJson.description).toBe('cool description')
    expect(packageJson.main).toBe('src/index.js')

    shell.rm('-rf', projectPath)
  })
})

jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000
