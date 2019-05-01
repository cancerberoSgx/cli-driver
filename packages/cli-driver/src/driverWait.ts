import { DriverCoreIO } from './driverCoreIO'
import { DriverError, WaitForDataOptions, WaitUntilOptions, WriteAndWaitForDataOptions } from './interfaces'
import { waitFor } from './waitFor'

/**
 * Base abstract class of Driver. Its responsibilities are wait for a condition and facilities for basing that condition (predicate) in the current data emitted from last write()
 */

export class DriverWait extends DriverCoreIO {
  /**
   * this error occurs when unser calls waitUntil* method with an interval greater than timeout
   */
  public static ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT: 'ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT' =
    'ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT'

  /**
   * this error occurs on waitUntil* methods timeouts
   */
  public static ERROR_WAITUNTIL_TIMEOUT: 'ERROR_WAITUNTIL_TIMEOUT' = 'ERROR_WAITUNTIL_TIMEOUT'

  /**
   * the more generic wait* method on which all the others are based. Returns a promise that is resolved only when given predicate is fulfilled or rejected if timeout ms passes. THe implementation will be calling the predicate function like polling each interval [[waitInterval]] milliseconds.
   * @param predicate a function that if return a truthy value will stop the polling
   * @param timeout default value is [[waitTimeout]]
   * @param interval default value is [[waitInterval]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @returns A promise resolved with the return value of the predicate if it ever return truthy or in other case if the predicate never returns truthy in given timeout it will be rejected unless rejectOnTimeout===false in which case the promise is resolved with false
   */
  public waitUntil<T>(
    predicate: ((...args: any[]) => Promise<T | boolean> | T | boolean) | WaitUntilOptions<T> | T,
    timeout = this.options.waitUntilTimeout,
    interval = this.options.waitUntilInterval,
    rejectOnTimeout = this.options.waitUntilRejectOnTimeout
  ): Promise<T | false | DriverError> {
    this.pushToCommandHistory({ name: 'waitUntil-begins' })

    if (typeof predicate === 'object' && (predicate as WaitUntilOptions<T>).predicate) {
      const options = predicate as WaitUntilOptions<T>
      predicate = options.predicate
      timeout = options.timeout || this.options.waitUntilTimeout
      interval = options.interval || this.options.waitUntilInterval
      rejectOnTimeout =
        options.rejectOnTimeout === false || this.options.waitUntilRejectOnTimeout === false ? false : true
    }
    if (interval >= timeout) {
      const error = this.buildError(DriverWait.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
      this.pushToCommandHistory({ name: 'waitUntil-ends', success: false, error })
      return rejectOnTimeout ? Promise.reject(error) : Promise.resolve(error)
    }

    if (typeof predicate === 'function') {
      return new Promise<T | false | DriverError>((resolve, reject) => {
        waitFor(predicate as any, interval, timeout)
          .then(data => {
            this.options.waitUntilSuccessHandler(data as any, predicate)
            this.pushToCommandHistory({
              name: 'waitUntil-ends',
              success: true,
              data,
              predicate: DriverWait.printWaitUntilPredicate(predicate)
            })
            resolve(data as any)
          })
          .catch(() => {
            const printedPredicate = DriverWait.printWaitUntilPredicate(predicate)
            const rejectMessage = `
${DriverWait.ERROR_WAITUNTIL_TIMEOUT} on whenUntil() !
Perhaps you want to increase driver.waitTimeout ? Description of the failed predicate:
${printedPredicate}
Data form last write: 
${this.getDataFromLastWrite()}
Timeout: ${timeout}
`
            const error = this.buildError(DriverWait.ERROR_WAITUNTIL_TIMEOUT, rejectMessage)
            this.options.waitUntilTimeoutHandler && this.options.waitUntilTimeoutHandler(error, predicate)
            this.pushToCommandHistory({ name: 'waitUntil-ends', success: false, predicate: printedPredicate })
            if (rejectOnTimeout) {
              reject(error)
            } else {
              resolve(error)
            }
          })
      })
    } else {
      return Promise.reject('waitUntil called with non function predicate')
    }
  }

  /**
   * alias for [[waitUntil]]
   */
  until: typeof DriverWait.prototype.waitUntil

  public static printWaitUntilPredicate(predicate: any): string {
    if (typeof predicate === 'function') {
      if (predicate.originalPredicate) {
        if (typeof predicate.originalPredicate === 'string') {
          return `${predicate.originalPredicate}`
        } else {
          return `${predicate.originalPredicate.toString()}`
        }
      } else {
        return `${predicate.toString()}`
      }
    } else {
      return `${predicate}`
    }
  }

  /**
   * Wait until new data matches given predicate. If not predicate is given will return the next data chunk that comes. Based on [[waitUntil]]
   * @param predicate condition stdout must comply with in other to stop waiting for. If none it will wait until next data chunk is received. If function that's the predicate function the data must comply with. If string, the predicate will be that new data contains this string
   * @param timeout wait timeout in ms
   * @param interval wait interval in ms
   * @param afterTimestamp if provided it will ork with data after that given timestamp. By default this timestamp is the last write()'s
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return resolved with the matched data or rejected if no data comply with predicate before timeout
   */
  public waitForData(
    predicate?: ((data: string) => boolean) | string | WaitForDataOptions,
    timeout = this.options.waitUntilTimeout,
    interval = this.options.waitUntilInterval,
    afterTimestamp = this.getLastWrite(),
    rejectOnTimeout = this.options.waitUntilRejectOnTimeout
  ): Promise<string | false | DriverError> {
    let predicate2: any

    if (typeof predicate === 'object' && (predicate as WaitUntilOptions<string>).predicate) {
      const options: WaitForDataOptions = predicate as WaitForDataOptions
      predicate2 = options.predicate
      timeout = options.timeout || this.options.waitUntilTimeout
      interval = options.interval || this.options.waitUntilInterval
      rejectOnTimeout =
        options.rejectOnTimeout === false || this.options.waitUntilRejectOnTimeout === false ? false : true
      afterTimestamp = options.afterTimestamp || this.getLastWrite()
    } else {
      predicate2 = predicate
    }

    const realPredicate = async () => {
      const data = await this.getDataFromTimestamp(afterTimestamp)
      if (typeof predicate2 === 'string') {
        return data.includes(predicate2) ? data : false
      } else if (predicate2 instanceof Function) {
        return predicate2(data) ? data : false
      } else {
        return true
      }
    }
    ;(realPredicate as any).originalPredicate = predicate2
    return this.waitUntil<string>(realPredicate, timeout, interval, rejectOnTimeout)
  }

  /**
   * alias for [[waitForData]]
   */
  forData: typeof DriverWait.prototype.waitForData

  /**
   * @param  commandToEnter same as in [[write]]
   * @param predicate same as in [[waitForData]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return same as in [[waitForData]]
   */
  public enterAndWaitForData(
    input: string | WriteAndWaitForDataOptions,
    predicate: ((data: string) => boolean) | string,
    timeout = this.options.waitUntilTimeout,
    interval = this.options.waitUntilInterval,
    afterTimestamp = this.getLastWrite(),
    rejectOnTimeout = true
  ): Promise<string | false | DriverError> {
    if (typeof input !== 'string') {
      ;(input as WriteAndWaitForDataOptions).input = this.writeToEnter((input as WriteAndWaitForDataOptions).input)
    } else {
      input = this.writeToEnter(input)
    }
    return this.writeAndWaitForData(input, predicate, timeout, interval, afterTimestamp, rejectOnTimeout)
  }

  /**
   * @param  commandToEnter same as in [[write]]
   * @param predicate same as in [[waitForData]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return same as in [[waitForData]]
   */
  public async writeAndWaitForData(
    input: string | WriteAndWaitForDataOptions,
    predicate: ((data: string) => boolean) | string,
    timeout: number = this.options.waitUntilTimeout,
    interval: number = this.options.waitUntilInterval,
    afterTimestamp: number = this.getLastWrite(),
    rejectOnTimeout = true
  ): Promise<string | false | DriverError> {
    if (typeof input !== 'string') {
      const options = input as any
      input = options.input
      predicate = options.predicate
      timeout = options.timeout || this.options.waitUntilTimeout
      interval = options.interval || this.options.waitUntilInterval
      afterTimestamp = options.afterTimestamp || this.getLastWrite()
      rejectOnTimeout =
        options.rejectOnTimeout === false || this.options.waitUntilRejectOnTimeout === false ? false : true
    }
    await this.write(input as string)
    return this.waitForData(predicate, timeout, interval, afterTimestamp, rejectOnTimeout)
  }

  /**
   * @param predicate same as in [[waitForData]]
   * @param commandToEnter same as in [[write]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return {Promise<string>} same as in [[waitForData]]
   */
  public waitForDataAndEnter(
    predicate: ((data: string) => boolean) | string | WriteAndWaitForDataOptions,
    input: string,
    timeout = this.options.waitUntilTimeout,
    interval = this.options.waitUntilInterval,
    afterTimestamp = this.getLastWrite(),
    rejectOnTimeout = true
  ): Promise<string | false | DriverError> {
    if (predicate && (predicate as WriteAndWaitForDataOptions).predicate) {
      ;(predicate as WriteAndWaitForDataOptions).input = this.writeToEnter(
        (predicate as WriteAndWaitForDataOptions).input
      )
    } else {
      input = this.writeToEnter(input)
    }
    return this.waitForDataAndWrite(predicate, input, timeout, interval, afterTimestamp, rejectOnTimeout)
  }

  /**
   * alias for [[waitForDataAndEnter]]
   */
  forDataAndEnter: typeof DriverWait.prototype.waitForDataAndEnter

  /**
   * @param predicate same as in [[waitForData]]
   * @param input same as in [[write]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return {Promise<string>} same as in [[waitForData]]
   */
  public waitForDataAndWrite(
    predicate: ((data: string) => boolean) | string | WriteAndWaitForDataOptions,
    input: string,
    timeout: number = this.options.waitUntilTimeout,
    interval: number = this.options.waitUntilInterval,
    afterTimestamp: number = this.getLastWrite(),
    rejectOnTimeout = true
  ): Promise<string | false | DriverError> {
    if (predicate && (predicate as WriteAndWaitForDataOptions).predicate) {
      const options = predicate as any
      predicate = options.predicate
      input = options.input
      timeout = options.timeout || this.options.waitUntilTimeout
      interval = options.interval || this.options.waitUntilInterval
      afterTimestamp = options.afterTimestamp || this.getLastWrite()
      rejectOnTimeout =
        options.rejectOnTimeout === false || this.options.waitUntilRejectOnTimeout === false ? false : true
    }
    return new Promise<string | false | DriverError>((resolve, reject) => {
      this.waitForData(predicate, timeout, interval, afterTimestamp, rejectOnTimeout)
        .then(async data => {
          await this.write(input)
          resolve(data)
        })
        .catch(ex => {
          rejectOnTimeout ? reject(ex) : resolve(ex)
        })
    })
  }

  /**
   * alias for [[waitForDataAndWrite]]
   */
  forDataAndWrite: typeof DriverWait.prototype.waitForDataAndWrite
}

DriverWait.prototype.forData = DriverWait.prototype.waitForData
DriverWait.prototype.until = DriverWait.prototype.waitUntil
DriverWait.prototype.forDataAndWrite = DriverWait.prototype.waitForDataAndWrite
DriverWait.prototype.forDataAndEnter = DriverWait.prototype.waitForDataAndEnter
