"use strict";
// this is the spec in which we are working right now
Object.defineProperty(exports, "__esModule", { value: true });
const cli_driver_1 = require("cli-driver");
const shell = require("shelljs");
const seq = cli_driver_1.ansi.keys.getSequenceFor;
describe('nano text editor', () => {
    let client;
    beforeEach(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
        client = new cli_driver_1.Driver();
        client.start({
            notSilent: true,
            waitUntilRejectOnTimeout: false,
            waitAfterWrite: 800,
            waitUntilTimeout: 500,
            waitUntilInterval: 100,
            waitUntilTimeoutHandler: (error, predicate) => {
                expect(`Timeout error with predicate '${cli_driver_1.Driver.printWaitUntilPredicate(predicate)}'`).toBe(undefined);
            }
        });
    });
    afterEach(async () => {
        await client.destroy();
    });
    it('should be able to open a non existing file, edit and save', async () => {
        console.log('1) open file edit and save ');
        await client.waitTime(1500);
        if (!shell.which('nano')) {
            pending('this system dont have nano installed - skipping test ');
            console.log('Sorry you need to have installed nano text editor to run this test. Bye. ');
            process.exit(1);
        }
        const file1 = 'tmp_nano1.txt';
        shell.rm('-rf', file1);
        await client.enter(`nano ${file1}`);
        await client.forData('GNU nano');
        await client.write('Hello World!');
        await client.write(seq({ name: 'x', ctrl: true })); // ctrl-x exit;
        await client.forData('Save modified buffer?');
        await client.write('y');
        await client.forData('File Name to Write:');
        await client.enter('');
        expect(shell.cat(file1).toString()).toContain('Hello World!');
        shell.rm('-rf', file1);
    });
    it('let me do undo&redo  and copy&paste', async () => {
        console.log('1) undo&redo  and copy&paste');
        await client.waitTime(1500);
        // try {
        if (!shell.which('nano')) {
            pending('this system dont have nano installed - skipping test ');
            console.log('Sorry you need to have installed nano text editor to run this test. Bye. ');
            process.exit(1);
        }
        expect(seq({ name: 'u', meta: true })).toBeTruthy();
        expect(seq({ name: 'e', meta: true })).toBeTruthy();
        expect(seq({ name: 'o', ctrl: true })).toBeTruthy();
        expect(seq({ name: 'x', ctrl: true })).toBeTruthy();
        expect(seq({ name: 'a', meta: true })).toBeTruthy();
        expect(seq({ name: '6', meta: true })).toBeTruthy();
        const file = 'tmp_nano2.txt';
        shell.rm('-rf', file);
        await client.enter(`nano`);
        await client.forData('GNU nano');
        await client.write('Hello World!');
        await client.write(seq({ name: 'o', ctrl: true })); // ctrl+o - writeout
        await client.forData('File Name to Write:');
        await client.enter(file, 300);
        expect(shell.cat(file).toString()).toContain('Hello World!');
        await client.write(seq({ name: 'return' }) + 'something else');
        // undo-redo
        expect(seq({ name: 'u', meta: true })).toBeTruthy();
        await client.write(seq({ name: 'u', meta: true })); // alt+u == undo;
        await client.write(seq({ name: 'e', meta: true })); // alt+e == redo;
        await client.write(seq({ name: 'return' }));
        await client.write('im a robot');
        await client.write(seq({ name: 'u', meta: true })); // alt+u == undo;
        await client.write(seq({ name: 'o', ctrl: true })); // ctrl+o - writeout
        await client.forData(`File Name to Write: ${file}`);
        await client.write(seq({ name: 'return' }));
        expect(shell.cat(file).toString()).toContain('something else');
        expect(shell.cat(file).toString()).not.toContain('im a robot');
        // mar text and copy paste
        await client.write(seq({ name: 'x', ctrl: true })); // ctrl-x exit;
        await client.enter('some extra text');
        await client.write(seq({ name: 'a', meta: true })); // meta-a - mark text
        await client.write(cli_driver_1.ansi.cursor.back());
        await client.write(cli_driver_1.ansi.cursor.back());
        await client.write(cli_driver_1.ansi.cursor.back());
        await client.write(cli_driver_1.ansi.cursor.back());
        await client.write(cli_driver_1.ansi.cursor.back());
        await client.write(seq({ name: '6', meta: true })); // meta-6 - copy marked text
        await client.write(cli_driver_1.ansi.cursor.down() + cli_driver_1.ansi.cursor.forward());
        shell.rm('-rf', file);
        // } catch (error) {
        //   console.log('error: ', error, error.stack);
        // }
    });
});
//# sourceMappingURL=nanoSpec.js.map