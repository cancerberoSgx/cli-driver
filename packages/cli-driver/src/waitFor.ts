// copied from https://github.com/sindresorhus/p-wait-fo but not based on booleans alone, resolve resolves with result and with timeout support

export function waitFor(condition, interval, timeout) {
  return new Promise((resolve, reject) => {
    interval = typeof interval === 'number' ? interval : 100
    timeout = typeof timeout === 'number' ? timeout : 2000
    const check = () => {
      Promise.resolve<any>(undefined)
        .then(condition)
        .then(val => {
          if (val) {
            resolve(val as any)
          } else {
            setTimeout(check, interval)
          }
        })
        .catch(reject)
    }
    setTimeout(reject, timeout)
    check()
  })
}
