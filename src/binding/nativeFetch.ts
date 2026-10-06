declare const __SAFE_ENGINE_NATIVE__: boolean | undefined

const nativeFetch = globalThis.fetch

if (typeof __SAFE_ENGINE_NATIVE__ !== 'undefined' && __SAFE_ENGINE_NATIVE__ && nativeFetch) {
  globalThis.fetch = async (...args) => {
    const response = await nativeFetch(...args)
    if (typeof response.headers?.get !== 'function') {
      response.headers = {
        get(name: string) {
          return name.toLowerCase() === 'content-type' ? 'application/json' : null
        },
      } as Headers
    }
    return response
  }
}
