export type EventCallbackType = (...args) => void

export interface EventMap {
  [key: string]: [EventCallbackType]
}

export default class BotEvent {
  events: EventMap = {}

  emit(name: string | number, ...params: any) {
    if (this.events[name]) {
      this.events[name].forEach(fc => fc(...params))
    }
  }

  on<T = any>(name: string | number, callback: (message: T) => void, target?): any {
    const bound = target ? callback.bind(target) : callback
    if (this.events[name]) {
      this.events[name].push(bound)
    } else {
      this.events[name] = [bound]
    }
  }
}
