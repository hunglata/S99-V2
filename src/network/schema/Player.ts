import { ArraySchema, Schema, type } from '@colyseus/schema'
import { Chess } from './Chess'

// An abstract player object, demonstrating a potential 2D world position
export class Player extends Schema {
  @type('string')
  userId = ''

  @type([Chess])
  chesses = new ArraySchema<Chess>()

  @type('uint8')
  dice = 0

  @type('uint16')
  score = 0

  @type('boolean')
  isReady = false
}
