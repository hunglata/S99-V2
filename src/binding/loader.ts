import { loadAll } from '@safe-engine/sdl'

import * as allAssets from '../assets'

export async function loadAssets(
  cb: (progress: number) => void,
  onCompleted: () => void | Promise<void>,
) {
  await loadAll(allAssets, cb)
  await onCompleted()
}
