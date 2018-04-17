var robot = require('robotjs')
var k = require('node-keys')

// robot.keyTap(k.keys({name: k.TAB, meta: true}))
robot.keyToggle('tab', 'down', ['alt'])
setTimeout(() => {
  robot.keyToggle('tab', 'up', ['alt'])
  // robot.keyToggle('\u001b\u0009')// k.keys({name: k.TAB, meta: true}))
}, 50)
