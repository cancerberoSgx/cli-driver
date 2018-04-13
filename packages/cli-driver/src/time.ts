/**
 * Usage:
 *
 * ```javascript
 *
    let t1: any = time()
    execute some task....
    console.log(`the time was ${time(t1)}` milliseconds`)

    ```
 * @param input?
 */

export const time = (input?: [number, number] | void): number | [number, number] => {
  if (!input) {
    return process.hrtime()
  } else {
    let hrtime = process.hrtime(input)
    const nanoseconds = (hrtime[0] * 1e9) + hrtime[1]
    return nanoseconds    }
}
