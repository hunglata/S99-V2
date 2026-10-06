import { Label, loadJsonAsset, loadScene, ProgressBar, Scene, Sprite } from '@safe-engine/sdl'

import { postAuthLoginGoogle, postAuthLoginGuest } from '../api/auth'
import { getProfiles } from '../api/profile'
import { items_json, sf_progress_bar, sf_progress_bg } from '../assets'
import AudioController from '../binding/AudioController'
import { loadAssets } from '../binding/loader'
import { requestPlayGamesServerAuthCode } from '../binding/PlayGames'
import { getAccessToken, getRefreshToken, getUserId, setUserId } from '../data/GameDataManager'
import { GameState } from '../data/GameState'
import { getProfiles as getLocalProfile } from '../data/profile'
import { CYAN } from '../helper/colors'
import { clearToken, setToken } from '../network/Http'
import Home from './Home'

export default class Loading extends Scene {
  loadingSprite: ProgressBar
  retryCount = 0

  async onEnter() {
    GameState.profile = await getLocalProfile()
    await this.syncProfile()

    console.log('[Loading] onEnter: loadAssets:start')
    await loadAssets(this.onProgress.bind(this), async () => {
      console.log('[Loading] loadAssets callback: loadJsonAsset:start')
      GameState.items = await loadJsonAsset<GetItemsResponse>(items_json)
      console.log('[Loading] loadAssets callback: loadJsonAsset:done')
      AudioController.Instance.playBackgroundMusic()
      console.log('[Loading] loadAssets callback: loadScene(Home)')
      loadScene(Home)
    })
    console.log('[Loading] onEnter: loadAssets:done')
  }

  private async syncProfile() {
    try {
      await this.tryLogin()
      await this.getMyProfile()
    } catch (error) {
      console.error('Failed to sync profile', error)
    }
  }

  onProgress(p: Float) {
    // console.log('onProgress', p)
    this.loadingSprite.setValue(p)
  }

  async tryLogin() {
    const serverAuthCode = await requestPlayGamesServerAuthCode()
    if (serverAuthCode) {
      try {
        console.log('[Loading] tryLogin: postAuthLoginGoogle:start')
        const { token, refreshToken } = await postAuthLoginGoogle(serverAuthCode)
        console.log('[Loading] tryLogin: postAuthLoginGoogle:done')
        setToken(token, refreshToken)
        return
      } catch (error) {
        console.error('[Loading] tryLogin: Google Play Games login failed', error)
      }
    }

    const tokenSaved = getAccessToken()
    // console.log('tokenSaved', tokenSaved)
    if (tokenSaved) {
      console.log('[Loading] tryLogin: using saved token')
      setToken(tokenSaved, getRefreshToken())
    } else {
      try {
        const id = getUserId()
        console.log('[Loading] tryLogin: postAuthLoginGuest:start', Boolean(id))
        const { guestId, token, refreshToken } = await postAuthLoginGuest(id)
        console.log('[Loading] tryLogin: postAuthLoginGuest:done')
        setToken(token, refreshToken)
        setUserId(guestId)
      } catch (error) {
        if (error === 404) {
          console.log('[Loading] tryLogin: create guest:start')
          const { guestId, token, refreshToken } = await postAuthLoginGuest()
          console.log('[Loading] tryLogin: create guest:done')
          setToken(token, refreshToken)
          setUserId(guestId)
        } else throw error
      }
    }
  }

  async getMyProfile() {
    try {
      console.log('[Loading] getMyProfile: getProfiles:start')
      const profile = await getProfiles()
      console.log('[Loading] getMyProfile: getProfiles:done')
      GameState.profile = profile
    } catch (error) {
      clearToken()
      this.retryCount++
      if (this.retryCount >= 3) {
        console.error('Failed to login guest after 3 attempts', error)
        return
      }
      console.log('Retrying guest login, attempt', this.retryCount)
      await this.tryLogin()
      await this.getMyProfile()
    }
  }

  __view() {
    <Scene>
      <Label node={{ x: 540, y: 140, color: CYAN, width: 400 }} string="Loading" />
      <Sprite node={{ x: 540, y: 250 }} spriteFrame={sf_progress_bg}>
        <ProgressBar $ref={this.loadingSprite} spriteFrame={sf_progress_bar} fillRange={0.5} />
      </Sprite>
    </Scene>
  }
}
