import { Driver } from '../src'
import { existsSync } from 'fs'
(async () => {
  const client = new Driver()
  await client.start()
  await client.write('echo "hello from user" > tmp_from_user.txt')
  await client.waitUntil(() => existsSync('tmp_from_user.txt'), 200)
  await client.destroy()
})()
