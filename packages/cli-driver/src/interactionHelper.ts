import { unique } from 'misc-utils-of-mine-generic'
import { ansi, Driver } from '.'

/**
 * A wrapper class for Driver with high level API for  CLI interactions
 */
export class InteractionHelper {

  constructor(protected client: Driver) {
  }

  destroy() {
    this.client.destroy()
  }

  commandTaking(ms: number, exitCode = 0, stdout = '', stderr = '') {
    return `node -e "setTimeout(()=>{process.stdout.write(${stdout ? JSON.stringify(stdout) : ''}); process.stderr.write(${stderr ? JSON.stringify(stderr) : ''}); process.exit(${exitCode})}, ${ms})"`
  }

  execCommandTaking(ms: number, exitCode = 0, stdout = '', stderr = '') {
    return this.client.enter(this.commandTaking(ms, exitCode, stdout, stderr))
  }

  async getStrippedALlData() {
    const s = await this.client.getAllData()
    return strip(s)
  }

  async clear() {
    await this.client.enter(ansi.erase.display(2))
  }

  /**
   * Returns last process exit code or undefined if not possible. IMPORTANT: relies on `$?` and `echo` so most
   * probably only works in unix (tested on macOs and Linux). 
   * 
   * This is useful on interactive applications that inquire some data and finally do some processing, in which
   * they could fail with an excepiton. no matter if the processing takes time, we enter `echo $?` commands with an
   * identifier that will be only executed after the application exits returning its exit code. 
   * 
   * However notice that while the app is running, althouhg not executed we are still writing to its stdin so use
   * it when you know the app is no longer litening for relevant data, just makind final processing and exit, this
   * is by waiting some time or in those cases where a key combination was presend to exit (q). 
   * 
   * TODO: example with "more" command
   */
  async getLastExitCode() {
    await this.client.cleanData()
    const u = unique('exitStatus')
    let s = await this.client.enterAndWait(`echo ${u}_$?_`, d => d.replace(`echo ${u}_$?_`, '').includes(u))
    const rx = new RegExp(`${u}_([\\d]+)_`, 'gm')
    s = s.replace(`echo ${u}_$?_`, '')
    const r = rx.exec(s)
    let exitStatus: number | undefined = parseInt(r && r[1] ? r[1] : '')
    exitStatus = isNaN(exitStatus) ? undefined : exitStatus
    return exitStatus
  }

  async waitForStrippedDataToInclude(s: string) {
    let d: string
    return await this.client.waitUntil(
      async () => (d = await this.client.getStrippedDataFromLastWrite()).includes(s) && d
    )
  }

  data = this.waitForStrippedDataToInclude.bind(this)
}

/**
 * strips ANSI codes from a string. From https://github.com/xpl/ansicolor/blob/master/ansicolor.js
 * @param {string} s a string containing ANSI escape codes.
 * @return {string} clean string.
 */
function strip(s: string) {
  return s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g, '') // hope V8 caches the regexp
}


