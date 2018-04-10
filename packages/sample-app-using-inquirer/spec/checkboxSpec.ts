import { Driver, ansi } from 'cli-driver'

async function enterAndWaitForData (client, enterString, dataContains) {
  const data = await client.enterAndWaitForData(enterString, dataContains)
  expect(data).toContain(dataContains)
  return data
}
describe('checkbox', () => {
  it('we should be able to programmatically ask for pizza in the command line', async () => {
    const client = new Driver()
    await client.start({ notSilent: true })
    enterAndWaitForData(client, 'node lib/src/checkbox', 'Select toppings')
    await client.waitTime(50)
    await client.write(ansi.cursor.down())
    await client.waitTime(50)
    await client.write(ansi.cursor.down())
    await client.waitTime(50)
    await client.write(' ')
    await client.waitTime(50)
    await client.enter('')
    enterAndWaitForData(client, '', 'Ground Meat, Mozzarella')
    client.destroy()
  })

  it('we should be able to programmatically ask for pizza by doing two downs and reverting selection', async () => {
    const client = new Driver()
    // debugger
    await client.start({ notSilent: true })
    await enterAndWaitForData(client, 'node lib/src/checkbox', 'Select toppings')
    await client.waitTime(50)
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.waitTime(50)
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.waitTime(50)
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.waitTime(50)
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.waitTime(50)
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.waitTime(50)
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.write('a')
    await client.waitTime(50)
    await client.enter('')
    await client.waitTime(50)
    const data = await client.getAllData()
    const foods = [
      'Pepperoni',
      'Ham',
      'Ground Meat',
      'Bacon',
      'Mozzarella',
      'Cheddar',
      'Parmesan',
      'Mushroom',
      'Tomato',
      'Pineapple',
      'Extra cheese'
    ].forEach(food => {
      expect(data).toContain(food)
    })

    client.destroy()
  })
})

jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000
