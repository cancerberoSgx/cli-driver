import { Driver } from '../src/index'
import * as path from 'path'
import * as shell from 'shelljs'

describe('automating npm init command', () => {
  it('npm init should create a package.json with filled information', async (done) => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

    try {

      const projectPath = path.join('tmp', 'my-cool-npm-project')
      shell.rm('-rf', projectPath)
      shell.mkdir('-p', projectPath)

      const client = new Driver()
      await client.start({
        cwd: projectPath,
        notSilent: true
      })
      await client.enter('npm init')

      // will wait until stdout prints 'package name:' and then enter the project name 'changed-my-mind-project'
      await client.waitForDataAndEnter('package name:', 'changed-my-mind-project')
      await client.waitForDataAndEnter('version:', '')
      await client.waitForDataAndEnter('description:', 'cool description')

      await client.waitForDataAndEnter('entry point:', 'src/index.js')
      await client.waitForDataAndEnter('test command:', 'jasmine')
      await client.waitForDataAndEnter('git repository:', '')
      await client.waitForDataAndEnter('keywords:', '')
      await client.waitForDataAndEnter('author:', '')
      await client.waitForDataAndEnter('license:', '')
      await client.waitForDataAndEnter(data => data.toLowerCase().includes('is this ok?'), '')

    // await client.waitTime(300) // give npm some time to write the file

      await client.waitUntil(() => shell.test('-f', `${projectPath}/package.json`))

      const packageJson = JSON.parse(shell.cat(`${projectPath}/package.json`))
      expect(packageJson.name).toBe('changed-my-mind-project')
      expect(packageJson.version).toBe('1.0.0')
      expect(packageJson.description).toBe('cool description')
      expect(packageJson.main).toBe('src/index.js')

      shell.rm('-rf', projectPath)

      await client.enter('exit')
      await client.destroy()
      done()
    } catch (ex) {
      expect(ex).toBe(undefined)
      done()
      throw ex
    }
  })

})
