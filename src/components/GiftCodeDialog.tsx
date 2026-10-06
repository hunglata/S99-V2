import { BaseComponentProps, Button, ComponentX, Label, Sprite, TextInput } from '@safe-engine/sdl'
import { sf_btn_confirm, sf_input_bg, sf_popup_giftcode, sf_x_icon } from '../assets'
import { BLACK } from '../helper/colors'
import BaseGameDialog from './BaseGameDialog'
import { DialogWrap } from './DialogWrap'

interface GiftCodeDialogProps extends BaseComponentProps<GiftCodeDialog> {
  onEnterCode: (code?: string) => void
}

export default class GiftCodeDialog extends ComponentX<GiftCodeDialogProps> {
  giftCodeInput: TextInput
  baseGameDialog: BaseGameDialog

  onPress() {
    this.props.onEnterCode(this.giftCodeInput.value)
  }

  onClose() {
    this.baseGameDialog.hide()
  }

  __view() {
    <DialogWrap>
      <BaseGameDialog $ref={this.baseGameDialog} spriteFrame={sf_popup_giftcode}>
        <Label string="Enter your Gift code" node={{ x: -43, y: -138, color: BLACK }} />
        <Sprite spriteFrame={sf_input_bg} node={{ x: -30, y: -67 }}>
          <TextInput $ref={this.giftCodeInput} placeholder="Enter code" />
        </Sprite>
        <Button spriteFrame={sf_btn_confirm} node={{ x: -8, y: 218 }} onPress={this.onPress} />
        <Button spriteFrame={sf_x_icon} node={{ x: 427, y: -303 }} onPress={this.onClose} />
      </BaseGameDialog>
    </DialogWrap>
  }
}
