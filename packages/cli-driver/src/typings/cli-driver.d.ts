import { ITerminal, IPtyForkOptions } from 'node-pty/lib/interfaces'
/**
 *
 * Usage example:
 *
 * ```js
 * import { Driver } from 'cli-driver'
 * const client = new Driver()
 * client.start({cwd: /home/sg/myproject})
 * client.enter('ls')
 * // now we wait until package.json is printed in stdout
 * const data = await client.waitForData(data => data.includes('package.json'))
 * ```
 */
export interface IDriver {
  
  /**
   * Adds a listener to the data event, fired when data is returned from the pty.
   * @param event The name of the event.
   * @param listener The callback function.
   */
  on (event: 'data', listener: (data: string) => void): void
  
  /**
   * Starts the client with given options. Will spawn a new terminal
   * @param options 
   */
  start (options?: DriverOptions): Promise<void>
  
  /**
   * destroy current terminal
   */
  destroy (): Promise<void>
  
  /**
   * Will write given text and then press ENTER. 
   * @param input the string to enter
   */
  enter (input: string): Promise<void>
  
  /**
   * writes given text in the terminal
   * @param str 
   */
  write (input: string): Promise<void>
  
  /**
   * Get data from last time [[write]] was issued. Remember that other methods like [[enter]] could also end up calling [[write]]
   * @param lastWrite Optional get data from given time
   */
  getDataFromLastWrite (lastWrite: number): Promise<string>
  
  /**
   * Get data printed after given timestamp
   * @param timestamp
   */
  getDataFromTimestamp (timestamp: number): Promise<string>
  
  getAllData (): Promise<string>
  
  /**
   * how periodically `wait*` functions will poll to check given predicate
   * @type {number}
   */
  waitInterval: number
  
  /**
   * for how long``wait*` function will wait until it return a rejected promise
   * @type {number}
   */
  waitTimeout: number
  
  /**
  * Wait until new data matches given predicate. If not predicate is given will return the next data chunk that comes.
  * @param predicate condition stdout must comply with in other to stop waiting for. If none it will wait until next data chunk is received. If function that's the predicate function the data must comply with. If string, the predicate will be that new data contains this string
  * @param timeout wait timeout in ms
  * @param interval wait interval in ms
  * @param afterTimestamp if provided it will ork with data after that given timestamp. By default this timestamp is the last write()'s
  * @return resolved with the matched data or rejected if no data comply with predicate before timeout
  */
  waitForData (
    predicate?: ((data: string) => boolean) | string,
    timeout?: number,
    interval?: number,
    afterTimestamp?: number
  ): Promise<string>


  waitUntil<T> (
    predicate: () => Promise<T | false>,
    timeout?: number,
    interval?: number
  ): Promise<T>

  /**
   * @param predicate same as in [[waitForData]]
   * @param commandToEnter same as in [[write]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @return {Promise<string>} same as in [[waitForData]]
   */
  waitForDataAndEnter (
    predicate: ((data: string) => boolean) | string,
    commandToEnter: string,
    timeout?: number,
    interval?: number,
    afterTimestamp?: number
  ): Promise<string>
  
  /**
   * @param  commandToEnter same as in [[write]]
   * @param predicate same as in [[waitForData]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @return same as in [[waitForData]]
   */
  enterAndWaitForData (
    commandToEnter: string,
    predicate: ((data: string) => boolean) | string,
    timeout?: number,
    interval?: number,
    afterTimestamp?: number
  ): Promise<string>

  /**
   * @param {number} ms
   */
  waitTime (ms: number): Promise<void>
}
  
export interface DriverDump {
  data: Array<DriverData>
  lastWrite: number
}


export interface DriverOptions extends IPtyForkOptions {
  /**
   * If string debug information will be dumped to a file with that name after client finish or an error is thrown. If boolean to stdout
   * @type {string | boolean}
   */
  debug?: string | boolean,
  notSilent?: boolean
}

export interface DriverData {
  data: string
  timestamp: number
}

import {Driver} from '../index'
export {Driver}


import * as ansi from 'ansi-escape-sequences'
export { ansi }

