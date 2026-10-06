import { Audio } from '@safe-engine/sdl'
import {
  back_ground_music_sfx,
  button_sfx,
  ding_sfx,
  ladder_sfx,
  sfx_step_sand_l_sfx,
  won_sfx,
} from '../assets'
import { getEffect, getMusic, setMusic } from '../data/GameDataManager'

export default class AudioController {
  private static _instance: AudioController
  private isBgmPlaying = false

  private constructor() { }

  public static get Instance() {
    if (!AudioController._instance) {
      AudioController._instance = new AudioController()
    }
    return AudioController._instance
  }

  playBackgroundMusic() {
    if (getMusic()) {
      if (!this.isBgmPlaying) {
        Audio.playMusic(back_ground_music_sfx, { loop: true })
        this.isBgmPlaying = true
      }
    }
  }

  stopBackgroundMusic(fadeOut = 0) {
    if (this.isBgmPlaying) {
      Audio.stopMusic(fadeOut)
      this.isBgmPlaying = false
    }
  }

  setMusicEnabled(enabled: boolean) {
    setMusic(enabled)
    if (enabled) {
      this.playBackgroundMusic()
    } else {
      this.stopBackgroundMusic()
    }
  }

  playEffectSound(type: string) {
    // console.log('play audio', type)
    if (getEffect()) {
      Audio.play(type, { loop: false })
    }
  }

  playButtonClickSound() {
    this.playEffectSound(button_sfx)
  }

  playStepSound() {
    this.playEffectSound(sfx_step_sand_l_sfx)
  }

  playLadderSound() {
    this.playEffectSound(ladder_sfx)
  }

  playEatSound() {
    this.playEffectSound(ding_sfx)
  }

  playFinishSound() {
    this.playEffectSound(won_sfx)
  }

  playWinSound() {
    this.playEffectSound(won_sfx)
  }

  playDiceRollSound() {
    this.playEffectSound(ding_sfx)
  }
}
