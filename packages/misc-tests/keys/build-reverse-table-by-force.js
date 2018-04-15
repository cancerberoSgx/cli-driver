const fs = require('fs');
const path = require('path');
const sequenceToKey = require('./keys').sequenceToKey;

function bruteForceBuildList() {
  const MAX = 65535; // tried with bigger numbers but no new results appeared
  let list = [];
  for (let i = 0; i < MAX; i++) {
    const unicode1 = String.fromCharCode(i);
    const key1 = sequenceToKey(unicode1);
    brutalForceBuildAddToList(list, key1);
    // for (let j = 0; j < MAX; j++) { // tried this but no new result appeared
    //   const unicode2 = String.fromCharCode(j);
    //   const key2 = sequenceToKey(unicode2);
    //   brutalForceBuildAddToList(list, key1+key2);
    // }
  }
  // fs.writeFileSync(path.join(__dirname, 'table1.txt'), list.map(k=>JSON.stringify(k)).join('\n'))
  list = list.map(k => k.key);
  fs.writeFileSync(path.join(__dirname, 'table1.json'), '[\n'+list.map(k=>JSON.stringify(k)).join(',\n')+'\n]');
}
function brutalForceBuildAddToList(list, key1) {
  // const key1 = sequenceToKey(unicode1+unicode2);
  if (key1 && key1.key) {
    if (
      !list.find(key2 =>
        key1.key.name === key2.key.name &&
          key1.key.ctrl == key2.key.ctrl &&
          key1.key.meta == key2.key.meta &&
          key1.key.shift == key2.key.shift &&
          key1.key.sequence == key2.key.sequence)
    ) {
      list.push(key1);
      console.log(`list is now ${list.length}`);
    }
    if (key1.ch != key1.key.sequence) {
      console.log(`key1.ch!=key1.key.sequence: ${JSON.stringify(key1)}`);
    }
  }
}
bruteForceBuildList();

// function removeDuplicates() {
//   const list1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'table1.json')).toString());
//   const list2 = [];
//   for (let i = 0; i < list1.length - 1; i++) {
//     const key1 = list1[i];
//     let found = false;
//     for (let j = i + 1; j < list1.length; j++) {
//       const key2 = list1[j];
//       if (
//         key1.key.name === key2.key.name &&
//         key1.key.ctrl == key2.key.ctrl &&
//         key1.key.meta == key2.key.meta &&
//         key1.key.shift == key2.key.shift
//       ) {
//         found = true;
//         break;
//       }
//     }
//     if (!found) {
//       list2.push(key1);
//     }
//   }

//   console.log(`list1: ${list1.length}, list2: ${list2.length}`);
//   fs.writeFileSync(path.join(__dirname, 'table1_nodup.json'), JSON.stringify(list2, null,2))
// }
// removeDuplicates();
