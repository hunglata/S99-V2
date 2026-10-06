import BotEvent from './BotEvent'

function getData(field) {
  return typeof field.toJSON === 'function' ? field.toJSON() : field
}

export default class Schema extends BotEvent {
  schema = []
  protected addKey(key) {
    if (!this.schema.includes(key)) {
      this.schema.push(key)
    }
  }

  set(key, value) {
    this[key] = value
  }

  get(key) {
    return this[key]
  }

  listen(key, callback) {
    this.on(key, callback)
  }

  toJSON() {
    const obj = {}
    this.schema.forEach((field) => {
      if (this[field] !== null && typeof this[field] !== 'undefined') {
        obj[field] = Array.isArray(this[field]) ? this[field].map(getData) : getData(this[field])
      }
    })
    return obj
  }
}

export declare type PrimitiveType
  = | 'string'
    | 'number'
    | 'boolean'
    | 'int8'
    | 'uint8'
    | 'int16'
    | 'uint16'
    | 'int32'
    | 'uint32'
    | 'int64'
    | 'uint64'
    | 'float32'
    | 'float64'
    | typeof Schema
export declare type DefinitionType
  = | PrimitiveType
    | PrimitiveType[]
    | {
      array: PrimitiveType
    }
    | {
      map: PrimitiveType
    }
    | {
      collection: PrimitiveType
    }
    | {
      set: PrimitiveType
    }

export function type(name: DefinitionType) {
  return function (target: Schema, propertyKey: string) {
    // let value: any;
    const getter = function () {
      return this[`_${propertyKey}`]
    }
    const setter = function (newVal: any) {
      const value = this[`_${propertyKey}`]
      // console.log(propertyKey, newVal, value, this);
      if (newVal === value) {
        return
      }
      this.emit(propertyKey, newVal, value)
      this.addKey(propertyKey)
      this[`_${propertyKey}`] = newVal
    }
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
    })
  }
}
