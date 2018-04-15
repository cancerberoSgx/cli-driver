import { Driver, ansi } from 'cli-driver'

describe('checkbox', () => {
  let client

  beforeAll(async () => {
    client = new Driver()
    await client.start({
      // notSilent: true,
      waitAfterWrite: 50, // on large inquirer lists we need to give it time to shown when scrolling them (for options outside the current viewport)
    })
  })

  afterAll(async () => {
    await client.destroy()
    // writeFileSync('tmp_checkboxSpec_alldata_log.txt', await client.getAllData())
    // writeFileSync('tmp_checkboxSpec_cmds_log.txt', JSON.stringify(await client.getCommandHistory(),null,2))
  })

  it('we should be able to programmatically ask for pizza in the command line', async () => {
    await client.enterAndWaitForData('node lib/src/checkbox', 'Select toppings')
    await client.write(ansi.cursor.down())
    await client.write(ansi.cursor.down())
    await client.write(' ')
    await client.enter('')
    await client.enterAndWaitForData('', 'Ground Meat, Mozzarella')
  })

  it('we should be able to programmatically ask for pizza by doing two downs and reverting selection', async () => {
    await client.enterAndWaitForData('node lib/src/checkbox', 'Select toppings')
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.write(' ' + ansi.cursor.down() + ansi.cursor.down())
    await client.write('a')
    await client.enter('')
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
    ]
    foods.forEach(food => {
      expect(data).toContain(food)
    })
  })
})

jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000
