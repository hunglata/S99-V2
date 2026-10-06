import * as sdl3 from 'sdl3'

export function requestPlayGamesServerAuthCode(): Promise<string | null> {
  const nativeSdl3 = sdl3 as typeof sdl3 & {
    requestPlayGamesServerAuthCode?: () => Promise<string | null>
  }
  if (!nativeSdl3.isNative || typeof nativeSdl3.requestPlayGamesServerAuthCode !== 'function') {
    return Promise.resolve(null)
  }
  return nativeSdl3.requestPlayGamesServerAuthCode()
}
