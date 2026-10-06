import { ArraySchema } from '../core/ArraySchema'
import { MapSchema } from '../core/MapSchema'
import BotSchema, { type } from '../core/Schema'
import { Player } from './BotPlayer'

export default class RoomState extends BotSchema {
  @type('string') currentTurn: string
  @type({ map: Player }) players = new MapSchema<Player>()
  @type(['uint8']) gifts = new ArraySchema<number>()
  @type('string') winner: string
  @type('boolean') isRolled = false
  @type('boolean') isMoved = false
}
