import { ansi, Driver } from '.'
import { InteractionHelper } from './interactionHelper'

export class InquirerInteractionHelper extends InteractionHelper {

  constructor(protected client: Driver) {
    super(client)
  }

  async focusFile(codeFix: string) {
    return this.arrowUntilFocused(this.client, codeFix, s => s.includes(` ❯◯ ${codeFix}`) || s.includes(` ❯◉ ${codeFix}`))
  }

  async focusListItem(label: string) {
    return this.arrowUntilFocused(this.client, label, s => s.includes(`❯ ${label}`))
  }

  async focusCheckboxListItem(label: string) {
    return this.arrowUntilFocused(this.client, label, s => s.includes(`❯◯ ${label}`))
  }

  async down(n: number) {
    for (let i = 0; i < n; i++) {
      await this.client.write(ansi.cursor.down())
      await this.client.time(10)
    }
  }

  async arrowUntilFocused(client: Driver, focused: string, predicate: (s: string) => boolean, arrow = ansi.cursor.down(), limit = 14) {
    for (let i = 0; i < limit; i++) {
      const s = await client.getStrippedDataFromLastWrite()
      if (predicate(s)) {
        return s
      }
      await this.client.write(arrow)
      await this.client.waitForData()
      await this.client.waitTime(100)
    }
    throw `Didn't found ${focused} selected in ${limit} cursor.up() strokes`
  }

  async unSelectAll(limit = 30) {
    const initial = await this.currentNotSelected()
    for (let i = 0; i < limit; i++) {
      const currentIsSelected = await this.currentSelected()
      if (currentIsSelected) {
        await this.client.writeAndWaitForData(' ', s => !!this.currentNotSelectedString(this.client.strip(s)))
      }
      await this.client.write(ansi.cursor.up())
      await this.client.waitForData()
      const current = await this.currentNotSelected()
      if (current === initial) {
        return
      }
    }
    throw `Didn't complete the loop after ${limit} cursor.up() strokes`
  }

  async currentNotSelected() {
    return this.currentNotSelectedString(await this.client.getStrippedDataFromLastWrite())
  }
  currentNotSelectedString(s: string) {
    const result = / ❯◯\s+(.+)\n/.exec(s)
    return result && result[1]
  }

  async selected() {
    const result = /  ◉\s+(.+)\n/.exec(await this.client.getStrippedDataFromLastWrite())
    return result && result[1]
  }

  async isCodeFixOptionNotSelected(option: string) {
    const s = await this.client.getStrippedDataFromLastWrite()
    return s.includes(`◯ ${option}`)
  }

  async currentSelected() {
    const result = / ❯◉\s+(.+)\n/.exec(await this.client.getStrippedDataFromLastWrite())
    return result && result[1]
  }
}
