import { Driver, ansi } from 'cli-driver'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 19000

describe('askAge', () => {
  it('askAge should not allow to proceed age under 18', async (done) => {
    const client = new Driver()
    await client.start()
    await client.enter('node lib/src/pizza')
    let data = await client.waitForData('Hi, welcome to Node Pizza')
    expect(data).toContain('Is this for delivery?')
    await client.enterAndWaitForData('n', 'What\'s your phone number')
    await client.enterAndWaitForData('123123', 'Please enter a valid phone number')
    await client.enterAndWaitForData('1231231232', 'What size do you need')
    await client.enterAndWaitForData(ansi.cursor.down(), 'How many do you need?')
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
    await client.enterAndWaitForData('2', 'Any comments on your purchase experience?')
    await client.enterAndWaitForData('I\'m a machine unsure...' , 'For leaving a comment, you get a freebie')

    data = await client.enterAndWaitForData(ansi.cursor.down() + ansi.cursor.down(), 'Order receipt:')
    expect(data).toContain('"toBeDelivered": false')
    expect(data).toContain('"toppings": "alldressed"')
    expect(data).toContain('"beverage": "7up"')
    expect(data).toContain('"prize": "cake"')
    expect(data).toContain('"size": "medium"')
    expect(data).toContain('"comments": "I\'m a machine unsure..."')

    await client.destroy()
    done()
  })
})

jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000
