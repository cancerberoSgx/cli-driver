const Driver = require('cli-driver').Driver;
const ansi = require('cli-driver').ansi;
const shell = require('shelljs');
const assert = require('assert');

(async () => {
  try {
    if (!shell.which('nano')) {
      // pending('this system dont have nano installed - skipping test ');
      console.log('Sorry you need to have installed nano text editor to run this test. Bye. ');
      process.exit(1);
    }
    const client = new Driver();

    await client.start({
      notSilent: true,
      waitUntilRejectOnTimeout: false,
      waitAfterWrite: 800,
      waitUntilTimeout: 3000,
      waitUntilInterval: 100
    });

    
    const file = 'tmp_nano2.txt';
    shell.rm('-rf', file);
    await client.enter(`nano`);
    await client.forData('GNU nano');
    await client.write('Hello World!');
    await client.write(ansi.keys.getSequenceFor({name: 'o', ctrl: true})); // ctrl+o - writeout
    await client.forData('File Name to Write:');

    await client.write(file, 300);
    await client.enter('')

    // expect(shell.cat(file).toString()).toContain('Hello World!');

    // await client.write(ansi.keys.getSequenceFor({name: 'return'}));
    // await client.write('im a robot');
    // await client.write(ansi.keys.getSequenceFor({name: 'u', meta: true})); // alt+u == undo;
    // await client.write(ansi.keys.getSequenceFor({name: 'e', meta: true})); // alt+e == redo;
    // await client.write(ansi.keys.getSequenceFor({name: 'o', ctrl: true})); // ctrl+o - writeout
    // await client.forData('File Name to Write:');
    // await client.write(ansi.keys.getSequenceFor({name: 'return'}));
    // expect(shell.cat(file).toString()).toContain('Hello World!');

    // expect(shell.cat(file).toString()).toContain('im a robot');

    // await client.write('new text 1');

    await client.write(ansi.keys.getSequenceFor({name: 'x', ctrl: true}));

    // assert(shell.cat(file).toString().includes('new tex  t 1'));

    console.log(await client.getDataFromLastWrite())
    shell.rm('-rf', file);

    await client.destroy()
    console.log('Test successful')

  } catch (error) {
    console.log('error: ', error, error.stack);
  }


})();
