import { SpineData } from '@safe-engine/sdl'

export class GameState {
  static player
  static invite = 'bot'
  static opponentName = 'bot'
  static opponentAvatar = ''
  static opponentCharacter: SpineData
  static isEntryInvite = false
  static mapIndex = 0
  static loadingScene = 'home'
  static profile: Profile
  static items: GetItemsResponse
}
