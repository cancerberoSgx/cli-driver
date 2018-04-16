const Driver = require('cli-driver').Driver;
const ansi = require('cli-driver').ansi;
const shell = require('shelljs');
const assert = require('assert');

(async () => {
  try {
    
    if (!shell.which('nano')) {
      console.log('Sorry you need to have installed nano text editor to run this test. Bye. ');
      process.exit(1);
    }
    const client = new Driver();
    await client.start({
      notSilent: true,
      waitUntilRejectOnTimeout: false,
      waitAfterWrite: 800,
      waitUntilTimeout: 1000,
      waitUntilInterval: 100,
      waitUntilTimeoutHandler: (error, predicate) => {
        assert.ok(!`Timeout error with predicate '${Driver.printWaitUntilPredicate(predicate)}'`)
      }
    });

    const file1 = 'tmp_nano1.txt';
    shell.rm('-rf', file1);
    await client.enter(`nano ${file1}`);
    
    await client.forData('GNU nano');

    await client.write('Hello World!');

    await client.write(ansi.keys.getSequenceFor({name: 'x', ctrl: true}))

    await client.forData('Save modified buffer?');

    await client.write('y');

    await client.forData('File Name to Write:');

    await client.enter('');

    assert.ok(shell.cat(file1).toString().includes('Hello World!'));

    shell.rm(file1)
    await client.destroy();
    
    console.log('Test successful')

  } catch (error) {
    console.error(error);
    console.log(error.stack);
    throw error;
  }

})();
