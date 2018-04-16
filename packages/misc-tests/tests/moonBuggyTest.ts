import { Driver, ansi } from 'cli-driver';
import * as shell from 'shelljs';
import { writeFileSync, write } from 'fs';
import { CURSOR_DOWN, TAB } from '../../cli-driver/lib/src/ansiGetSequenceFor';
const seq = ansi.keys.getSequenceFor;
const RETURN = ansi.keys.return();
const ESC = ansi.keys.escape();


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
    waitUntilTimeout: 13500,
    waitUntilInterval: 30,
    debug: true,
    waitUntilTimeoutHandler: (error, predicate) => {
      fail(`Timeout error with predicate '${Driver.printWaitUntilPredicate(predicate)}'`);
    }
  });
  if (!shell.which('moon-buggy') || !shell.which('bc')) {
    fail('this system dont have emacs and bc commands installed - skipping test ');
  }
  await client.enter('moon-buggy', 1000);

  await client.forData(`RET:start game`);
  await client.enterAndWaitForData('', `good luck`);

  let notEnd = true;

  // client.forData('Omm').then(() => {notEnd = false; });
  while (notEnd) {
    // await client.forData('\r\n#  \u001b[2');
    await client.forData('(/\r\n####  \u001b');




    await client.write(' ');
  }
    // setTimeout(async () => {
    //   writeFileSync('tmp_moonbuggy_log.txt', JSON.stringify(await client.getDebugInformation(), null, 2));
    // }, 9000);

  // await client.write(seq({name: 'h', ctrl: true}) + seq({name: 'r'})); // c-h r  open emacs manual
  // await client.forData('Emacs is the extensible, customizable');
  // for (let i = 0; i < 20; i++) {
  //   await client.write(seq({name: CURSOR_DOWN, ctrl: true}), 100);
  // }
  // await client.forData('The Detailed Node Listing', 5000);

  // await client.write(seq({name: TAB}), 1000);
  // await client.enter();

  // await client.forData('The cursor in the selected window shows');

  // await client.write(seq({name: 'x', ctrl: true}) + seq({name: 'c', ctrl: true})); // ‘C-x C-c` Kill Emacs

  // await client.enter('echo "4+12+56+87" | bc');
  // await client.forData('159'); // we are back in the shell

  } catch (error) {
      console.log(error, error.stack);
      fail(error);
  }
})();
