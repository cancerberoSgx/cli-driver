import { DriverCore } from './driverCore'
import { now } from './time'

/**
 * Core abstract class of Driver. Responsible of handling base write operations and read operations.
 */

export class DriverCoreIO extends DriverCore {
  // WRITE

  private lastWrite: number = 0

  protected getLastWrite(): number {
    return this.lastWrite
  }

  public static ERROR_ERROR_PUSHED_WAS_NEVER_TRUE: string = 'ERROR_ERROR_PUSHED_WAS_NEVER_TRUE'
  /**
   * Writes given text in the terminal
   * @param str writes given text. Notice that this won't submit ENTER. For that you need to append "\r" or use
   * [[enter]]s
   * @param waitAfterWrite number of milliseconds after which resolve write / enter promise. Default: 0
   */
  public write(input: string = '', waitAfterWrite: number = this.options.waitAfterWrite): Promise<void> {
    return new Promise((resolve, reject) => {
      this.lastWrite = now() // TODO: all the performance magic should happen here - we should accommodate all the data
      this.ptyProcess.write(input, flushed => {
        //  TODO: timeout if flushed is never true or promise is never resolved?
        if (flushed) {
          setTimeout(() => {
            this.pushToCommandHistory({ name: 'write', input, waitAfterWrite })
            resolve()
          }, waitAfterWrite)
        } else {
          const error = this.buildError(
            DriverCoreIO.ERROR_ERROR_PUSHED_WAS_NEVER_TRUE,
            'write() flushed=true never happen for input: ' + input
          )
          this.pushToCommandHistory({ name: 'write', lastWrite: this.lastWrite, error })
          reject(error)
        }
      })
    })
  }

  protected writeToEnter(input: string = ''): string {
    return input + '\r'
  }

  /**
   * Will write given text and then press ENTER. Just like [[write]] but appending `'\r'`
   * @param input the string to enter
   * @param waitAfterWrite number of milliseconds after which resolve write / enter promise. Default: 0
   */
  public enter(
    input: string = '',
    waitAfterEnter: number = this.options.waitAfterEnter || this.options.waitAfterWrite
  ): Promise<void> {
    return this.write(this.writeToEnter(input), waitAfterEnter)
  }

  // READ

  /**
   * Get data from last time [[write]] was issued. Remember that other methods like [[enter]] could also end up
   * calling [[write]]
   * @param lastWrite Optional get data from given time
   */
  public getDataFromLastWrite(lastWrite: number = this.lastWrite): string {
    return this.getDataFromTimestamp(this.lastWrite)
  }
  /**
   * same as [[getDataFromLastWrite]] but applying [[strip]].
   * @param lastWrite Optional get data from given time
   */
  public getStrippedDataFromLastWrite(lastWrite: number = this.lastWrite): string {
    return this.strip(this.getDataFromTimestamp(this.lastWrite))
  }
  /**
   * Get data printed after given timestamp
   */
  public getDataFromTimestamp(timestamp: number): string {
    // TODO: make me faster please !  could be storing  last index and last data returned index we know is less than this.lastwrite so we dont have to iterate all the array and concatenate all again
    let i = 0
    for (; i < this.getData().length; i++) {
      if (this.getData()[i].timestamp >= timestamp - this.options.waitUntilInterval / 2) {
        // TODO magic
        break
      }
    }
    let dataFrom = ''
    for (; i < this.getData().length; i++) {
      dataFrom += this.getData()[i].data
    }
    return dataFrom
  }
  /**
   * get all the data collected from [[start]]
   */
  public getAllData(): Promise<string> {
    // TODO: make me faster, please !! I think we can solve much of all the performance problems by storing all data and only concatenate from allDataLastIndex
    let ad = ''
    this.getData().forEach(d => (ad += d.data))
    return Promise.resolve(ad)
  }

  private commandHistory: Array<any> = []
  protected pushToCommandHistory(cmd: any): any {
    if (this.options.debug) {
      cmd.lastWrite = this.lastWrite
      this.commandHistory.push(cmd)
    }
  }
  /**
   * get information about all commands run in this driver instance. Will only work when options.debug===true
   */
  public getCommandHistory(): Promise<Array<any>> {
    return Promise.resolve(this.commandHistory)
  }

  /**
   * strips ANSI codes from a string. From https://github.com/xpl/ansicolor/blob/master/ansicolor.js
   * @param {string} s a string containing ANSI escape codes.
   * @return {string} clean string.
   */
  strip(s: string) {
    return s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g, '') // hope V8 caches the regexp
  }
}
