declare const __SAFE_ENGINE_NATIVE__: boolean | undefined

const NativeWebSocket = globalThis.WebSocket

if (typeof __SAFE_ENGINE_NATIVE__ !== 'undefined' && __SAFE_ENGINE_NATIVE__ && NativeWebSocket && !NativeWebSocket.prototype.__normalizesUint8Array) {
  const send = NativeWebSocket.prototype.send

  NativeWebSocket.prototype.send = function (data: unknown) {
    const payload = data instanceof Uint8Array ? new Uint8Array(data).buffer : data
    return send.call(this, payload)
  }

  NativeWebSocket.prototype.__normalizesUint8Array = true
}
