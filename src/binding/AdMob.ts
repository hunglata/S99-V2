import * as sdl3 from 'sdl3'

export const isNativeApp = sdl3.isNative

export function showRewardedAd(): Promise<boolean> {
  const nativeSdl3 = sdl3 as typeof sdl3 & {
    showRewardedAd?: () => Promise<boolean>
  }
  if (!isNativeApp || typeof nativeSdl3.showRewardedAd !== 'function') {
    return Promise.resolve(false)
  }
  return nativeSdl3.showRewardedAd()
}
