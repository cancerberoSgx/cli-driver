import { prompt } from 'inquirer'
function askAge () {
  return new Promise(resolve => {
    prompt<any>([
      {
        type: 'input',
        name: 'age',
        message: 'Enter your age',
        validate: age => {
          const val = parseInt(age, 10)
          return val && val > 0 && val < 100 ? true : `Invalid age: ${age}`
        },
        default: 0
      }
    ])
    .then(answer => {
      if (answer.age > 18) {
        console.log(
          `Since you are ${answer.age} years old you can proceed. Welcome`
        )
      } else {
        console.log(`You cannot proceed with ${answer.age} years old. Good bye`)
      }
      resolve(answer.age)
    })
  })
}
askAge()
export default askAge
