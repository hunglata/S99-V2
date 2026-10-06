import { BaseComponentProps, ComponentX, UILayout, Widget } from '@safe-engine/sdl'
import { sf_s_icon_hero, sf_s_icon_item, sf_s_icon_odat, sf_s_icon_thang, sf_s_icon_xucxac } from '../assets'
import TabItem from './TabItem'

interface BottomTabProps extends BaseComponentProps<BottomTab> {
  onSelectTab: (i: number) => void
}

export default class BottomTab extends ComponentX<BottomTabProps> {
  tabs: TabItem[] = []
  // selectedIndex = 0

  onStart() {
    this.tabs.forEach((tab, i) => {
      tab.index = i
    })
    this.onChangeSelected(0)
  }

  onChangeSelected(index: number) {
    // this.selectedIndex = index
    this.props.onSelectTab(index)
    this.tabs.forEach((tab, i) => {
      if (i === index) {
        // tab.node.x = i * 208
        tab.selected()
      } else {
        // tab.node.x = i * 208 + (i > index ? 56.5 : -56.5)
        tab.reset()
      }
    })
  }

  __view() {
    <UILayout node={{ xy: [0, 2238] }}>
      <TabItem $push={this.tabs} icon={sf_s_icon_hero} title="HERO" onSelect={this.onChangeSelected} />
      <TabItem $push={this.tabs} icon={sf_s_icon_xucxac} title="DICE" onSelect={this.onChangeSelected} />
      <TabItem $push={this.tabs} icon={sf_s_icon_odat} title="STAND" onSelect={this.onChangeSelected} />
      <TabItem $push={this.tabs} icon={sf_s_icon_item} title="EFFECT" onSelect={this.onChangeSelected} />
      <TabItem $push={this.tabs} icon={sf_s_icon_thang} title="LADDER" onSelect={this.onChangeSelected} />
      <Widget bottom={198} inSafeArea={false} />
    </UILayout>
  }
}
