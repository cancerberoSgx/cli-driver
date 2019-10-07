import { ansi, Driver } from '.'
import { InteractionHelper } from './interactionHelper'

declare const expect: any

/**
 * A wrapper class for Driver with high level API for testing CLI interactions with libraries like jasmine, jest,
 * mocha (uses expect())
 */
export class InteractionSpecHelper extends InteractionHelper {

  constructor(protected client: Driver, protected expectations: {
    expectToContain: (actual: string, expected: string) => any;
    expectNotToContain: (actual: string, expected: string) => any;
  } = {
      expectToContain: (a: string, b: string) => expect(a).toContain(b),
      expectNotToContain: (a: string, b: string) => expect(a).not.toContain(b)
    }) {
    super(client)
  }

  /**
   * This could not work on some situations, if so preffer to use [expectExitWith]
   */
  async expectExitWith(zeroExitCode?: boolean | number) {
    const c = await this.getLastExitCode()
    let fail = typeof zeroExitCode === 'number' ? c !== zeroExitCode : zeroExitCode ? c === 0 : c !== 0
    if (fail) {
      this.expectations.expectNotToContain(fail ? (zeroExitCode === true || zeroExitCode === 0) ? 'exit without error' : 'exit with error' : 'did not happen', 'did not happen')
    }
    else {
      this.expectations.expectToContain(fail ? (zeroExitCode === true || zeroExitCode === 0) ? 'exit without error' : 'exit with error' : 'did not happen', 'did not happen')
    }
    return c
  }

  /**
   * This could not work on some situations, if so preffer to use [expectExitWith]
   */
  async expectLastExitCode(zeroExitCode?: boolean) {
    if (typeof zeroExitCode === 'undefined') {
      this.expectations.expectToContain(await this.client.enterAndWait(`echo 1; node -e "console.log('better than echo:', 1+1)"; echo "flush";`, 'better than echo: 2'), 'better than echo: 2')
    }
    else {
      await this.client.enter(`echo "exit code $?"; node -e "console.log('better than echo:', 1+1)"; echo "flush";`)
      await this.client.waitTime(100)
      if (zeroExitCode) {
        this.expectations.expectToContain(await this.client.wait('better than echo: 2'), `exit code 0`)
      }
      else {
        expect(await this.client.waitForData('better than echo: 2')).not.toContain(`exit code 0`)
      }
    }
  }

  async controlC() {
    await this.client.write(ansi.keys.getSequenceFor({ name: 'c', ctrl: true }))
    await this.expectLastExitCode()
  }
}
