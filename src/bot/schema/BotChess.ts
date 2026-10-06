import BotSchema, { type } from '../core/Schema'

export class Chess extends BotSchema {
  @type('uint8')
  position = 0

  @type('uint8')
  kick = 0
}
