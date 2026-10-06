import { Schema, type } from '@colyseus/schema'

export class Chess extends Schema {
  @type('uint8')
  position = 0

  @type('uint8')
  kick = 0
}
