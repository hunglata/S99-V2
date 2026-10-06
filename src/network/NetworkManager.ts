import { Client, Room } from 'colyseus.js'
import { BattleRoomState } from './schema/BattleRoomState'

function createClient(endpoint: string) {
  const match = endpoint.match(/^(wss?):\/\/([^/:]+)(?::(\d+))?(\/[^?]*)?(?:\?(.*))?$/)
  if (!match) {
    throw new Error(`Invalid Colyseus endpoint: ${endpoint}`)
  }

  return new Client({
    hostname: match[2],
    port: match[3] ? Number(match[3]) : undefined,
    secure: match[1] === 'wss',
    pathname: match[4] ?? '',
    searchParams: match[5],
  })
}

export default class NetworkManager {
  private static instance: NetworkManager = null
  client: Client = null
  battleRoom: Room<BattleRoomState> = null

  constructor() {
    console.log('[Network] client:create:start')
    this.client = createClient(import.meta.env.VITE_WS_ENDPOINT)
    console.log('[Network] client:create:done')
  }

  static get Instance() {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager()
    }
    return NetworkManager.instance
  }
}
