import { Driver } from 'cli-driver';
import { CURSOR_DOWN, TAB, RETURN, ESC, keys } from 'node-keys';
import * as shell from 'shelljs';

describe('emacs text editor', () => {

  let client: Driver;
  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;
    client = new Driver();
    await client.start({
      notSilent: true,
      waitUntilRejectOnTimeout: false,
      waitAfterWrite: 1000,
      waitUntilTimeout: 500,
      waitUntilInterval: 100,
      waitUntilTimeoutHandler: (error, predicate) => {
        expect(`Timeout error with predicate '${Driver.printWaitUntilPredicate(predicate)}'`).toBe(undefined);
      }
    });
    // await client.waitTime(1000);
  });

  afterEach(async () => {
    await client.destroy();
    // await client.waitTime(1000);
  });

  it('emacs open and quit', async () => {

    try {
      if (!shell.which('emacs') || !shell.which('bc')) {
        pending('this system dont have emacs and bc commands installed - skipping test ');
        console.log('this system dont have emacs and bc commands installed - skipping test. Bye. ');
      }

    // setTimeout(async () => {
    //   writeFileSync('tmp_emacs_log.txt', JSON.stringify(await client.getDebugInformation(), null, 2));
    // }, 10000);
    await client.enter('emacs -nw');
    // await client.waitTime(1000);
    await client.enter('', 1000);

    await client.forData(`Welcome to GNU Emacs`, 1000);

    await client.write(keys({name: 'x', ctrl: true}) + keys({name: 'c', ctrl: true})); // ‘C-x C-c` Kill Emacs

    await client.enter('echo "4+12+56+87" | bc');
    await client.forData('159'); // we are back in the shell

    } catch (error) {
        console.log(error, error.stack);
        fail(error);
    }
  });


  it('emacs open manual and navigate', async () => {

    try {
    if (!shell.which('emacs') || !shell.which('bc')) {
      pending('this system dont have emacs and bc commands installed - skipping test ');
      console.log('this system dont have emacs and bc commands installed - skipping test. Bye. ');
    }
    await client.enter('emacs -nw -fs -fw -mm -fh');
    // await client.waitTime(1000);
    await client.enter('', 1000);

    await client.forData(`Welcome to GNU Emacs`, 1000);

    await client.write(keys({name: 'h', ctrl: true}) + keys({name: 'r'})); // c-h r  open emacs manual
    await client.forData('Emacs is the extensible, customizable');
    for (let i = 0; i < 20; i++) {
      await client.write(keys({name: CURSOR_DOWN, ctrl: true}), 100);
    }
    await client.forData('The Detailed Node Listing', 5000);

    await client.write(keys({name: TAB}), 1000);
    await client.enter();

    await client.forData('The cursor in the selected window shows');

    await client.write(keys({name: 'x', ctrl: true}) + keys({name: 'c', ctrl: true})); // ‘C-x C-c` Kill Emacs

    await client.enter('echo "4+12+56+87" | bc');
    await client.forData('159'); // we are back in the shell

    } catch (error) {
        console.log(error, error.stack);
        fail(error);
    }
  });


});
