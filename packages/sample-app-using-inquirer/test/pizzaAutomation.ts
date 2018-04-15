import { Driver, ansi } from 'cli-driver'
import * as assert from 'assert'

(async () => {

  try {

    const client = new Driver()
    await client.start({
      notSilent: true,
      waitAfterWrite: 800,
    })

    await client.enter('node lib/src/pizza')
    await client.waitForData('Hi, welcome to Node Pizza')
    await client.enterAndWaitForData('n', 'What\'s your phone number')
    await client.enterAndWaitForData('123123', 'Please enter a valid phone number')
    await client.enterAndWaitForData('1231231232', 'What size do you need')
    await client.write(ansi.cursor.down())
    await client.write(ansi.cursor.up())
    await client.write(ansi.cursor.down())
    await client.enterAndWaitForData('', 'How many do you need?')
    await client.enterAndWaitForData('two', 'Please enter a number')
    await client.enterAndWaitForData('2', 'What about the toppings?')

    await client.writeAndWaitForData('p', 'Pepperoni and cheese')
    await client.writeAndWaitForData(ansi.keys.backspace() + 'a', 'All dressed')
    await client.writeAndWaitForData(ansi.keys.backspace() + 'w', 'Hawaiian')

    let data: any = await client.writeAndWaitForData(ansi.keys.backspace() + 'h', 'Help, list all options')
    data = await client.enterAndWaitForData('', 'Answer:')
    assert.ok(data.includes('p) Pepperoni and cheese'))
    assert.ok(data.includes('a) All dressed'))
    await client.enterAndWaitForData('a', 'You also get a free 2L beverage')
    await client.write('1')
    await client.write(ansi.keys.backspace())
    await client.write('4')
    await client.enterAndWaitForData('', 'Please enter a valid index')
    await client.enterAndWaitForData('2', 'Any comments on your purchase experience?')
    await client.enterAndWaitForData('what a question' , 'For leaving a comment, you get a freebie')

    data = await client.enterAndWaitForData(ansi.cursor.down() + ansi.cursor.down(), 'Order receipt:')

    const selectionShouldContain = [
      '"toBeDelivered": false',
      '"toppings": "alldressed"',
      '"beverage": "7up"',
      '"prize": "cake"',
      '"size": "medium"',
      '"comments": "what a question"',
    ]

    selectionShouldContain.forEach(shouldContain => {
      assert.ok(data.includes(shouldContain))
    })
  } catch (error) {
    console.log('Error in test: ', error, error.stack)
  }
})()
