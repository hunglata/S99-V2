import {
  CommandPayload,
  DecodedRealtimeMessage,
  RealtimeSnakeMove,
  RealtimeSnakePiece,
  RealtimeSnakePlayer,
  RealtimeSnakeState,
  WIRE_MESSAGE_NAMES,
  WireMessageType,
  decodeMessage,
  encodeMessage,
} from './schema'

export {
  WireMessageType,
  type CommandPayload,
  type DecodedRealtimeMessage,
  type RealtimeSnakeMove,
  type RealtimeSnakePiece,
  type RealtimeSnakePlayer,
  type RealtimeSnakeState,
  WIRE_MESSAGE_NAMES,
}

export function sendMessage(ws: WebSocket, type: WireMessageType, data: CommandPayload = {}) {
  ws.send(encodeMessage(type, data))
}

export function decodedMessage(buffer: ArrayBuffer | Uint8Array): DecodedRealtimeMessage {
  return decodeMessage(buffer) as DecodedRealtimeMessage
}
