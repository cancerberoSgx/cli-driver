
const fs = require('fs')
const emitKeypressEvents = require('./keys').emitKeypressEvents

console.log('start pressing keys and they will be logged in keys-output.txt file. End the program with ctrl-c')

process.stdin.on('keypress', (ch, key)=>{
  fs.appendFileSync('testing/keys_output.txt', JSON.stringify({ch, key})+'\n')
})
emitKeypressEvents(process.stdin)