import { Driver } from 'cli-driver';
import * as ansiEscapes from 'ansi-escapes';
const eraseScreen = ansiEscapes.eraseScreen;
import * as stripAnsi from 'strip-ansi';
import { writeFileSync } from 'fs';

async function test() {

  const driver = new Driver();

  await driver.start({
    // notSilent: true
  });
  // await driver.write(eraseScreen);
  await driver.enter('echo 1');
  // await driver.enter('clear');
  await driver.enter('echo hello world');
  // await driver.enter('clear');
  await driver.enter('echo 3');
  // ansiEscapes;

  await driver.waitTime(400);
  const allData = await driver.getAllData();




  // console.log(pretty);

  // writeFileSync('pepe.txt', allData);

  const lines = await getOutputLinesCleaned(driver);
  // console.log('output: \n', lines.join('\n'));
  console.log('getCharacterAt', await getCharacterAt(lines, 1, 0));
  console.log('getCharacterAt', await getCharacterAt(lines, 3, 4));
  console.log('getCharacterAt', await getCharactersAtRow(lines, 3, 0, 4));
  console.log('getCharacterAt', await getCharactersAtRegion(lines, 1, 3, 0, 4));


  // const pretty = stripAnsi(allData);

  // console.log({eraseScreen, allData, pretty});
  await driver.destroy();
}
test();

async function getOutputLinesCleaned(driver): Promise<string[]> {
  const allData = await driver.getAllData();
  const lines = allData.split('\r\n');
  const result: string[] = [];
  const stripAnsiFunc = stripAnsi;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let cleaned: string;
    if (line.includes('\u0007')) { // workaround for https://github.com/chalk/strip-ansi/issues/20
      cleaned = stripAnsiFunc(line.split('\u0007')[1]);
    }
    else {
      cleaned = stripAnsiFunc(line);
    }
    result.push(cleaned);
  }
  return result;
}

function getCharacterAt(lines: string[], row: number, col: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (row >= lines.length) {
      resolve(''); // 'error lines dont have that much rows'
    }
    const line = lines[row];
    if (col >= line.length) {
      resolve('');
    }
    else {
      resolve(line[col]);
    }
  });
}

async function getCharactersAtRow(lines: string[], row: number, col1: number, col2: number): Promise<string[]> {
  // TODO: make me faster - dont call getCaracterAt many times - loop here!
  let result: string[] = [];
  if (col2 <= col1) {
    return [];
  }
  for (let i = col1; i <= col2; i++) {
    result.push(await getCharacterAt(lines, row, i));
  }
  return result;
}

async function getCharactersAtRegion(lines: string[], row1: number, row2: number, col1: number, col2: number): Promise<string[][]> {
   // TODO: make me faster - dont call getCharactersAtRow many times - loop here!
  let result: string[][] = [];
  if (col2 <= col1 || row2 <= row1) {
    return [];
  }
  for (let i = row1; i <= row2; i++) {
      result.push(await getCharactersAtRow(lines, i, col1, col2));
  }
  return result;
}
