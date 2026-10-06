type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

interface JsonObject {
  [key: string]: JsonValue
}

type Awaitable<T> = T | Promise<T>;

interface AuthRequest {
  query?: string
  headers?: Record<string, string>
}

type AuthResult
  = | boolean
    | string
    | {
      ok?: boolean
      userId?: string
      provider?: string
      status?: number
      message?: string
    };

interface RuntimeRoom {
  id?: string | null
  state?: GameState
  broadcast?: (message: string | ArrayBuffer) => void
}

interface RuntimePlayer {
  id?: string
  playerId?: string
  provider?: string
  room?: RuntimeRoom
  send?: (message: string | ArrayBuffer) => void
}

interface PieceState extends JsonObject {
  id: string
  position: number
  finished: boolean
}

interface PlayerState extends JsonObject {
  id: string
  position: number
  pieces: PieceState[]
  finishedPieces: number
  connected: boolean
  rolls: number
}

interface LastMove extends JsonObject {
  playerId: string
  pieceId: string
  dice: number
  from: number
  landed: number
  to: number
  bounced: boolean
  transport: 'ladder' | 'snake' | null
}

interface GameState extends JsonObject {
  game: 'snake-ladder'
  roomId: string | null
  boardSize: number
  status: 'waiting' | 'playing' | 'finished'
  winner: string | null
  currentTurn: string | null
  players: Record<string, PlayerState>
  turnOrder: string[]
  lastMove: LastMove | null
  snakes: Record<number, number>
  ladders: Record<number, number>
}

interface IncomingCommand {
  type: string
  playerId?: unknown
  dice?: unknown
  pieceId?: unknown
}

interface IncomingObject {
  type?: unknown
  action?: unknown
  playerId?: unknown
  dice?: unknown
  value?: unknown
  pieceId?: unknown
  piece?: unknown
  chessId?: unknown
  chess?: unknown
  payload?: unknown
}

declare const Room:
  | {
    broadcast?: (message: string | ArrayBuffer) => void
  }
  | undefined;

declare const Player:
  | {
    send?: (player: RuntimePlayer, message: string | ArrayBuffer) => void
  }
  | undefined;
