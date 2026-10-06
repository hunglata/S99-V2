import { Button, ComponentX, loadScene, Widget } from '@safe-engine/sdl'

import { sf_btn_back } from '../assets'
import Home from '../scene/Home'

export default class BackButton extends ComponentX {
  onPress() {
    loadScene(Home)
  }

  __view() {
    <Button spriteFrame={sf_btn_back} onPress={this.onPress}>
      <Widget top={1} left={0} inSafeArea={false} />
    </Button>
  }
}
