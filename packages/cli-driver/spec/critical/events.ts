import { Driver } from '../../src/index'

xdescribe('event emitter', () => {
  it('should emit events', async done => {
    const client = await new Driver().start()
    expect(await client.enterAndWait('ls -a', '..')).not.toContain('newFile.txt')
    await client.destroy()
    done()
  })
})
