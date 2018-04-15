import { Driver, ansi } from 'cli-driver'
import { writeFileSync } from 'fs'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 29000

describe('pizza', () => {
  let client

  beforeAll(async () => {
    client = new Driver()
    await client.start({
      // notSilent: true,
      // debug: true,
      // waitAfterWrite: 800,
    })
  })

  afterAll(async () => {
    // writeFileSync('tmp_pizzaSpec_alldata_log.txt', await client.getAllData())
    // writeFileSync('tmp_pizzaSpec_cmds_log.txt', JSON.stringify(await client.getCommandHistory(),null,2))
    await client.destroy()
  })

  it('should allow instrument inquirer pizza example', async () => {

    await client.enter('node lib/src/pizza')
    let data = await client.waitForData('Hi, welcome to Node Pizza')
    expect(data).toContain('Is this for delivery?')
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

    data = await client.writeAndWaitForData(ansi.keys.backspace() + 'h', 'Help, list all options')
    data = await client.enterAndWaitForData('', 'Answer:')
    expect(data).toContain('p) Pepperoni and cheese')
    expect(data).toContain('a) All dressed')
    expect(data).toContain('w) Hawaiian')
    expect(data).toContain('h) Help, list all options')
    await client.enterAndWaitForData('a', 'You also get a free 2L beverage')
    await client.write('1')
    await client.write(ansi.keys.backspace())
    await client.write('4')
    await client.enterAndWaitForData('', 'Please enter a valid index')
    await client.enterAndWaitForData('2', 'Any comments on your purchase experience?')
    await client.enterAndWaitForData('what a question' , 'For leaving a comment, you get a freebie')

    data = await client.enterAndWaitForData(ansi.cursor.down() + ansi.cursor.down(), 'Order receipt:')

    expect(data).toContain('"toBeDelivered": false')
    expect(data).toContain('"toppings": "alldressed"')
    expect(data).toContain('"beverage": "7up"')
    expect(data).toContain('"prize": "cake"')
    expect(data).toContain('"size": "medium"')
    expect(data).toContain('"comments": "what a question"')

  })
})
