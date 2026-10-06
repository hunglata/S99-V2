import BotSchema from './Schema'

export class MapSchema<V = any> extends BotSchema {
  mapObjKeys = []
  onAdd: (value, key) => void
  onRemove: (value, key) => void

  set(key, value: V) {
    this[key] = value
    if (this.onAdd) {
      this.onAdd(value, key)
    }
    this.addKey(key)
    if (!this.mapObjKeys.includes(key)) {
      this.mapObjKeys.push(key)
    }
  }

  get(key): V {
    return this[key]
  }

  keys(): string[] {
    return this.mapObjKeys
  }

  forEach(callback: (item: V, index: number) => void) {
    this.mapObjKeys.forEach((key) => {
      callback(this[key], key)
    })
  }
}
