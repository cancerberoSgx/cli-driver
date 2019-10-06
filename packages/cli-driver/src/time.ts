/**
 * Usage:
 * 
 * ```javascript
 * 
 *   let t1 = time()
 *   execute some task....
 *   const t2 = time(t1)
 *   console.log(`the task took ${t2}` milliseconds`)
 * 
 *     ```
 * @param input?
 */

export const time = (input?: [number, number] | void): number | [number, number] => {
  if (!input) {
    return process.hrtime()
  } else {
    let hrtime = process.hrtime(input)
    const nanoseconds = hrtime[0] * 1e9 + hrtime[1]
    return nanoseconds
  }
}

const t0: any = time()
/**
 * returns a timestamp like `Date.now()` but in this case this timestamp means nothing special. Just extracting
 * two now() calls will give the millisecond difference: for example:
 * 
 * 
 * ```javascript
 * 
 *   let t0 = now()
 *   execute some task...
 *   console.log(`the task took ${now()-t0}` milliseconds`)
 * 
 *     ```
 */
export const now = (): number => {
  return time(t0) as number
}
