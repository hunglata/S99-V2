import { ComponentX, Panel, TouchEventRegister, Widget } from '@safe-engine/sdl';
import { DIM } from '../helper/colors';
import BaseGameDialog from './BaseGameDialog';

export class DialogWrap extends ComponentX {
  onTouchStart() {
    const dialog = this.node.getComponentInChildren(BaseGameDialog)
    if (dialog) {
      // dialog.hide()
    }
  }

  __view() {
    <Panel color={DIM}>
      <TouchEventRegister onTouchStart={this.onTouchStart} />
      <Widget top={0} left={0} right={0} bottom={0} inSafeArea={false} />
    </Panel>
  }
}
