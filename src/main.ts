import './binding/nativeWebSocket'
import './binding/nativeFetch'

import { Engine, Label, loadAll, loadScene } from '@safe-engine/sdl'

import { lilita_one_regularFont, sf_progress_bar, sf_progress_bg } from './assets'
import Loading from './scene/Loading'
import { designedResolution } from './settings'

(async () => {
  await Engine.start('Safex sdl demo', designedResolution.width, designedResolution.height, 'fixed-width')
  Label.defaultFont = lilita_one_regularFont
  Label.defaultSize = 48
  // Engine.showStats()
  await loadAll([sf_progress_bar, sf_progress_bg])
  loadScene(Loading)
})()
