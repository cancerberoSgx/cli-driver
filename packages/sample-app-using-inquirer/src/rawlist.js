

require('inquirer').prompt([
  {
    type: 'rawlist',
    name: 'beverage',
    message: 'You also get a free 2L beverage',
    default: "7up",
    choices: ['Pepsi', '7up', 'Coke']
  }
]).then(answers => {
  console.log('\nOrder receipt:')
  console.log(JSON.stringify(answers, null, '  '))
})
