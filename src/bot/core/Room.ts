import { ClockTimer } from '@colyseus/timer'
import BotClient from './Client'
import Schema from './Schema'

const client = new BotClient('player')
export abstract class Room<State = any, Metadata = any> extends Schema {
  clock: ClockTimer = new ClockTimer()
  state: State
  sessionId = 'player'

  // client
  onMessage<T = any>(type: string | number, callback: (message: T) => void): any {
    this.on(`server_${type}`, callback)
  }

  send(type: string | number, message?: any): void {
    this.emit(`client_${type}`, client, message)
  }

  leave(consented?: boolean): void {
    // do nothing
  }

  tick(): void {
    this.clock.tick()
  }

  // server side
  listenClient(type: string | number, message?: any) {
    this.on(`client_${type}`, message)
  }

  broadcast(type: string | number, message?: any) {
    this.emit(`server_${type}`, message)
  }
}
