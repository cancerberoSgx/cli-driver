import { Driver, ansi } from 'cli-driver';
import * as shell from 'shelljs';
const seq = ansi.keys.getSequenceFor;
const RETURN = ansi.keys.return();
const ESC = ansi.keys.escape();

describe('vi text editor', () => {

  let client: Driver;
  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    client = new Driver();
    client.start({
      notSilent: true,
      waitUntilRejectOnTimeout: false,
      waitAfterWrite: 500,
      waitUntilTimeout: 500,
      waitUntilInterval: 100,
      waitUntilTimeoutHandler: (error, predicate) => {
        expect(`Timeout error with predicate '${Driver.printWaitUntilPredicate(predicate)}'`).toBe(undefined);
      }
    });
  });

  afterEach(async () => {
    await client.destroy();
  });

  it('vi open and quit', async () => {

    // try {
    if (!shell.which('vi')) {
      pending('this system dont have vi installed - skipping test ');
      console.log('Sorry you need to have installed vi text editor to run this test. Bye. ');
    }
    await client.enter('vi');
    await client.forData(`~`);
    await client.write(ESC);
    await client.enter(':q');
    await client.enter('echo 1234');
    await client.forData('1234'); // we are back in the shell

    // } catch (error) {
    //     console.log(error, error.stack);
    //     fail(error);
    // }
  });


  it('vi edit a file', async () => {

    // try {
    if (!shell.which('vi')) {
      pending('this system dont have vi installed - skipping test ');
      console.log('Sorry you need to have installed vi text editor to run this test. Bye. ');
    }
    const file = 'tmp_vi_file.txt';
    shell.rm('-rf', file);
    await client.enter('vi');
    await client.forData(`~`);
    await client.write('ttttt');
    await client.waitTime(500);
    expect(await client.getAllData()).not.toContain('ttttt'); // cause we'r not in edit mode yet
    await client.write(ESC + 'i'); // edit mode
    await client.enter('hello world');

    await client.enter(ESC + ':q');
    await client.forData(`No write since last change`);
    await client.enter(ESC + ':w');
    await client.forData(`No current filename`);
    await client.enter(ESC + `:w ${file}`);
    await client.forData(`"${file}" [New file]`);
    await client.enter(ESC + ':q', 200);

    await client.enter('echo 1234');
    await client.forData('1234'); // we are back in the shell

    expect(shell.cat(file).toString()).toContain('hello world');

    await client.write(RETURN);
    // } catch (error) {
    //     console.log(error, error.stack);
    //     fail(error);
    // }
  });


});
