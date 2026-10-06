import BotSchema from './Schema'

export class ArraySchema<V = any> extends BotSchema {
  listObjKeys = []
  onAdd: (value, key) => void
  onRemove: (value, key) => void

  push(value: V) {
    const key = this.listObjKeys.length
    if (this.onAdd) {
      this.onAdd(value, key)
    }
    this.addKey(key)
    this.listObjKeys.push(value)
  }

  splice(itemIndex: number, deleteCount?: number): V[] {
    const removed = this.listObjKeys.splice(itemIndex, deleteCount)
    removed.forEach((rem, i) => {
      this.onRemove(rem, itemIndex + i)
    })
    return removed
  }

  indexOf(value: V): number {
    return this.listObjKeys.indexOf(value)
  }

  forEach(callback: (item: V, index: number) => void) {
    this.listObjKeys.forEach((value, key) => {
      callback(value, key)
    })
  }
}
