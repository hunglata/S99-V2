import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'
import { Player } from './Player'

export class BattleRoomState extends Schema {
  @type('string') currentTurn: string
  @type({ map: Player }) players = new MapSchema<Player>()
  @type(['uint8']) gifts = new ArraySchema<number>()
  @type('string') winner: string
  @type('boolean') isRolled = false
  @type('boolean') isMoved = false
}
