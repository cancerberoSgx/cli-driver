import { Driver, InteractionSpecHelper } from '../../src/index'

describe('interaction helpers', () => {

  it('exitWith exit 0, execCommandTaking', async done => {
    const client = await new Driver().start()
    const helper = new InteractionSpecHelper(client)
    expect(await helper.getStrippedALlData()).not.toContain('foo')
    await helper.execCommandTaking(300, 0, 'foo')
    await helper.expectExitWith(0)
    await helper.data('foo')
    await client.destroy()
    done()
  })

  it('exitWith exit 1, execCommandTaking', async done => {
    const client = await new Driver().start()
    const helper = new InteractionSpecHelper(client)
    expect(await helper.getStrippedALlData()).not.toContain('bar')
    await helper.execCommandTaking(300, 1, 'bar')
    await helper.expectExitWith(1)
    await helper.data('bar')
    await client.destroy()
    done()
  })
})
