import { getAccessToken } from '../data/GameDataManager'
import { WS_DISCONNECT } from './constant.network'
import { CommandPayload, DecodedRealtimeMessage, WIRE_MESSAGE_NAMES, WireMessageType, decodedMessage, sendMessage } from './socket'

type Listener = (data: any) => void

class SocketEventEmitter {
  private listeners = new Map<string, Set<Listener>>()

  on(type: string, cb: Listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type).add(cb)
  }

  off(type: string, cb: Listener) {
    this.listeners.get(type)?.delete(cb)
  }

  emit(type: string, data: any) {
    this.listeners.get(type)?.forEach(cb => cb(data))
  }

  clear() {
    this.listeners.clear()
  }
}

export default class WebSocketManager {
  private url = ''
  private ws: WebSocket | null = null
  private reconnectInterval = 2000
  private maxRetries = 5
  private retryCount = 0
  private isManuallyClosed = false
  private emitter = new SocketEventEmitter()
  private static instance: WebSocketManager = null

  constructor() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = this
    }
    return WebSocketManager.instance
  }

  static getInstance() {
    return new WebSocketManager()
  }

  connect(url: string, reconnectInterval = 2000, maxRetries = 5) {
    this.url = this.withAccessToken(url)
    this.reconnectInterval = reconnectInterval
    this.maxRetries = maxRetries
    this.isManuallyClosed = false

    if (this.ws) {
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.onmessage = null
      this.ws.close()
    }

    this.ws = new WebSocket(this.url)
    this.ws.binaryType = 'arraybuffer'

    this.ws.onmessage = async (event) => {
      try {
        const message = decodedMessage(await this.toArrayBuffer(event.data))
        this.emitMessage(message)
      } catch (err) {
        console.error('Error decoding WebSocket message:', err)
      }
    }
    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)
      this.emitter.emit(WS_DISCONNECT, false)

      if (!this.isManuallyClosed) {
        this.retryCount++
        if (this.retryCount <= this.maxRetries) {
          setTimeout(() => this.connect(url, this.reconnectInterval, this.maxRetries), this.reconnectInterval + this.retryCount * 1000)
        } else {
          console.error('Max retries reached. Giving up.')
        }
      }
    }

    return new Promise<Event>((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket was not created.'))
        return
      }

      this.ws.onopen = (event) => {
        console.log('WebSocket connected')
        this.retryCount = 0
        resolve(event)
      }
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.ws?.close()
        reject(error)
      }
    })
  }

  listen(type: WireMessageType | string, cb: Listener) {
    const eventName = `${type}`
    this.emitter.on(eventName, cb)
    return () => this.emitter.off(eventName, cb)
  }

  sendMessage(type: WireMessageType, data: CommandPayload = {}) {
    if (this.isConnected()) {
      console.log('send', WIRE_MESSAGE_NAMES[type], data)
      sendMessage(this.ws, type, data)
    } else {
      console.error('WebSocket is not open. Cannot send message.')
    }
  }

  close() {
    this.isManuallyClosed = true
    this.ws?.close()
    this.ws = null
    this.emitter.clear()
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private emitMessage(message: DecodedRealtimeMessage) {
    console.log('receive', WIRE_MESSAGE_NAMES[message.type], message.payload)
    this.emitter.emit(`${message.type}`, message.payload)
    this.emitter.emit(WIRE_MESSAGE_NAMES[message.type], message.payload)
  }

  private async toArrayBuffer(data: MessageEvent['data']) {
    if (data instanceof ArrayBuffer) return data
    if (data instanceof Blob) return await data.arrayBuffer()
    if (data instanceof Uint8Array) return data
    throw new Error('Unsupported WebSocket message payload.')
  }

  private withAccessToken(url: string) {
    const token = getAccessToken()
    if (!token) return url

    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}token=${encodeURIComponent(token)}`
  }
}
