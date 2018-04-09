export class Keys {

  /**
   * Moves the cursor n (default 1) cells in the given direction. If the cursor is already at the edge of the screen, this has no effect.
   */
  public static get CURSOR_UP (): string {
    return `\u001b[A`
  }
  /**
   * Moves the cursor n (default 1) cells in the given direction. If the cursor is already at the edge of the screen, this has no effect.
   */
  public static get CURSOR_DOWN (): string {
    return `\u001b[B`
  }
  /**
   * Moves the cursor n (default 1) cells in the given direction. If the cursor is already at the edge of the screen, this has no effect.
   */
  public static get CURSOR_FORWARD (): string {
    return `\u001b[C`
  }

  /**
   * Moves the cursor n (default 1) cells in the given direction. If the cursor is already at the edge of the screen, this has no effect.
   */
  public static get CURSOR_BACK (): string {
    return `\u001b[D`
  }

}
