import { DriverWait } from './driverWait'
import { DebugInfo } from './interfaces'

/**
 * Usage example:
 * 
 * ```js
 * import { Driver   q} from 'cli-driver'
 * const client = new Driver()
 * const options = {cwd: '/home/sg/myproject', noSilent: true}
 * client.start()
 * client.enter('ls')
 * 
 * // now we wait until package.json is printed in stdout
 * const data = await client.waitForData(data => data.includes('package.json'))
 * ```
 * 
 * The options are documented [[DriverOptions]]
 * 
 * All methods return promises, so you can use async/await as in the previous example or then().catch().
 * 
 * Emit "data",  "exit" and "start" events
 */

export class Driver extends DriverWait {
  /**
   * return information about all the commands and state of this driver instance. commandHistory only available
   * when options.debug===true
   */
  public async getDebugInformation(): Promise<DebugInfo> {
    const debugInfo: DebugInfo = {
      commandHistory: await this.getCommandHistory(),
      lastWrite: this.getLastWrite(),
      dataFromLastWrite: await this.getDataFromLastWrite(),
      allData: await this.getAllData(),

      shellCommand: this.options.shellCommand()
    }
    return Promise.resolve(debugInfo)
  }
}
