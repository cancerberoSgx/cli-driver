import { Driver } from 'cli-driver';
import { CURSOR_DOWN, TAB, keys } from 'node-keys';
import * as shell from 'shelljs';


function fail(msg) {
  console.log(msg);
  process.exit(1);
}
(async () => {
  try {
    let client: Driver  = new Driver();
  await client.start({
    notSilent: true,
    waitUntilRejectOnTimeout: false,
    waitAfterWrite: 1000,
    waitUntilTimeout: 500,
    waitUntilInterval: 100,
    debug: true,
    waitUntilTimeoutHandler: (error, predicate) => {
      shell.exec('clear');
      fail(`Timeout error with predicate '${Driver.printWaitUntilPredicate(predicate)}'`);
    }
  });
  if (!shell.which('emacs') || !shell.which('bc')) {
    fail('this system dont have emacs and bc commands installed - skipping test ');
  }
  await client.enter('emacs -nw -fs -fw -mm -fh');
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
    shell.exec('clear');
      console.log(error, error.stack);
      fail(error);
  }
})();
