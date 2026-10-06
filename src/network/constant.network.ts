export const WS_CONNECTED = 'WS_CONNECTED'
export const WS_DISCONNECT = 'WS_DISCONNECT'
export const FIND_MATCH = 'FIND_MATCH'
export const JOIN_ROOM = 'JOIN_ROOM'
export const NETWORK_ERROR = 'NETWORK_ERROR'

export const BATTLE_ROOM = 'BattleRoom'
export const WAITING_ROOM = 'waiting'

export enum GameResult {
  Win,
  Lose,
  Draw,
}

export enum MessageType {
  READY_BATTLE,
  START_BATTLE,
  ROLL_DICE,
  MOVE_CHESS,
  INVITE,
  ACCEPT_BATTLE,
  FIND_MATCH,
  RE_MATCH,
  BOT_BATTLE,
  CANCEL_INVITE,
  REFUSE_INVITE,
  LEAVE_GAME,
}

export const COUNT_END = 'COUNT_END'
export const ROLL_DICE = 'ROLL_DICE'
export const ROLL_ANIM_DONE = 'ROLL_ANIM_DONE'
export const MOVE_ANIM_DONE = 'MOVE_ANIM_DONE'
export const JUMPED = 'JUMPED'
export const PLAY_TIME = 10
export const TURN_TIMEOUT = PLAY_TIME * 1000
export const NEXT_TURN_COUNTDOWN = 2
export const NEXT_TURN_DELAY = NEXT_TURN_COUNTDOWN * 1000
export const SNAKE_LADDER_ANIMATION_TIME = 1500
export const MOVE_ANIMATION_TIME = 300
export const ROLL_DICE_ANIMATION_TIME = 2000

export enum MapType {
  SHORT,
  LONG,
}

export enum PlayerStatus {
  Idle,
  WaitingFriend,
  FindMatching,
  Ready,
  Started,
}
