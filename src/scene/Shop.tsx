import {
  Button,
  Container,
  instantiate,
  Label,
  loadAll,
  loadScene,
  Node,
  Scene,
  ScrollView,
  Size,
  SpineSkeleton,
  Sprite,
  Touch,
  TouchEventRegister,
  unloadAll,
  Widget
} from '@safe-engine/sdl'
import { getWinSize } from 'sdl3'
import {
  items_json,
  sf_background_1,
  sf_bar_1,
  sf_bar_2,
  sf_bridge_1,
  sf_bridge_2,
  sf_btn_back,
  sf_btn_buy,
  sf_btn_select,
  sf_button_add,
  sf_ic_gem_bg,
  sf_ic_gold_bg,
  sf_icon_gem,
  sf_icon_gold,
  sf_icon_tick,
  sf_rectangle_2,
  sf_s_icon_hero,
  sf_s_icon_item,
  sf_s_icon_odat,
  sf_s_icon_thang,
  sf_s_icon_xucxac,
  sf_s_item_hero_1,
  sf_s_item_hero_2,
  sf_s_item_hero_3,
  sf_s_item_hero_4,
  sf_s_item_hero_5,
  sf_s_item_hero_6,
  sf_s_item_skin_06,
  sf_s_item_skin_07,
  sf_s_item_skin_08,
  sf_s_item_skin_09,
  sf_s_item_skin_10,
  sf_s_item_skin_11,
  sf_s_item_skin_12,
  sf_s_item_skin_13,
  sf_s_item_skin_14,
  sf_s_item_skin_15,
  sf_s_item_skin_16,
  sf_s_item_skin_17,
  sf_s_preview,
  sf_s_slot_item,
  sf_s_snake_1,
  sf_s_snake_10,
  sf_s_snake_11,
  sf_s_snake_2,
  sf_s_snake_3,
  sf_s_snake_4,
  sf_s_snake_5,
  sf_s_snake_6,
  sf_s_snake_7,
  sf_s_snake_8,
  sf_s_snake_9,
  sf_s_strock_slot,
  sf_stand_4,
  sf_stand_5,
  sp_cauthang,
  sp_dice_1,
  sp_dice_2,
  sp_dice_3,
  sp_dice_4,
  sp_dice_5,
  sp_dice_6,
  sp_hero_1,
  sp_hero_2,
  sp_hero_3,
  sp_hero_4,
  sp_hero_5,
  sp_hero_6,
  sp_hero_7,
  sp_hero_8,
  sp_ladder_2,
  sp_snake_1,
  sp_snake_10,
  sp_snake_11,
  sp_snake_2,
  sp_snake_3,
  sp_snake_4,
  sp_snake_5,
  sp_snake_6,
  sp_snake_7,
  sp_snake_8,
  sp_snake_9,
  sp_touch,
} from '../assets'
import BottomTab from '../components/BottomTab'
import ShopItem from '../components/ShopItem'
import { setCoin, setGem } from '../data/GameDataManager'
import { GameState } from '../data/GameState'
import { getItemsBought, postItemById, postItemByIdEquip } from '../data/item'
import { BROWN } from '../helper/colors'
import { TabSlot } from '../helper/constant'
import { createWarningText } from '../helper/func'
import Home from './Home'

export default class Shop extends Scene {
  static readonly heroes = [sf_s_item_hero_1, sf_s_item_hero_3, sf_s_item_hero_5, sf_s_item_hero_6]
  static readonly dices = [sf_s_item_skin_17, sf_s_item_skin_16, sf_s_item_skin_15, sf_s_item_skin_14, sf_s_item_skin_13, sf_s_item_skin_12]
  static readonly dicesSpine = [sp_dice_1, sp_dice_2, sp_dice_3, sp_dice_4, sp_dice_5, sp_dice_6]
  static readonly snakes = [
    sf_s_snake_1,
    sf_s_snake_2,
    sf_s_snake_3,
    sf_s_snake_4,
    sf_s_snake_5,
    sf_s_snake_6,
    sf_s_snake_7,
    sf_s_snake_8,
    sf_s_snake_9,
    sf_s_snake_10,
    sf_s_snake_11,
  ]

  static readonly snakesSpine = [
    sp_snake_1,
    sp_snake_2,
    sp_snake_3,
    sp_snake_4,
    sp_snake_5,
    sp_snake_6,
    sp_snake_7,
    sp_snake_8,
    sp_snake_9,
    sp_snake_10,
    sp_snake_11,
  ]

  static readonly stands = [sf_s_preview, sf_stand_4, sf_stand_5]
  static readonly ladder = [sf_s_item_skin_07, sf_s_item_skin_08, sf_s_item_skin_09, sf_s_item_skin_10, sf_s_item_skin_11]
  static readonly laddersSpine = [sp_cauthang, sp_ladder_2]
  static readonly laddersSprite = [sf_bridge_1, sf_bridge_2]
  static readonly heroesSpine = [sp_hero_2, sp_hero_4, sp_hero_6, sp_hero_8]
  static readonly heroesSpineBlack = [sp_hero_1, sp_hero_3, sp_hero_5, sp_hero_7]
  static readonly allRes = [
    sf_background_1,
    sf_bar_1,
    sf_bar_2,
    sf_btn_back,
    sf_btn_select,
    sf_button_add,
    sf_ic_gem_bg,
    sf_ic_gold_bg,
    sf_icon_gem,
    sf_icon_gold,
    sf_rectangle_2,
    sf_s_icon_hero,
    sf_s_icon_item,
    sf_s_icon_thang,
    sf_s_icon_xucxac,
    sf_s_item_hero_1,
    sf_s_item_hero_2,
    sf_s_item_hero_3,
    sf_s_item_hero_4,
    sf_s_item_hero_5,
    sf_s_item_hero_6,
    sf_s_item_skin_06,
    sf_s_item_skin_17,
    sf_s_item_skin_16,
    sf_s_item_skin_15,
    sf_s_item_skin_14,
    sf_s_item_skin_13,
    sf_s_item_skin_12,
    sf_s_item_skin_07,
    sf_s_item_skin_08,
    sf_s_item_skin_09,
    sf_s_item_skin_10,
    sf_s_item_skin_11,
    sf_s_preview,
    sf_stand_4,
    sf_stand_5,
    sf_s_slot_item,
    sf_s_strock_slot,
    sp_hero_1,
    sp_hero_2,
    sp_hero_3,
    sp_hero_4,
    sp_hero_5,
    sp_hero_6,
    sp_hero_7,
    sp_hero_8,
    sf_s_icon_odat,
    sf_icon_tick,
    sf_btn_buy,
    sf_bridge_1,
    items_json,
    ...Shop.snakes,
    ...Shop.laddersSprite,
    ...Shop.dices,
    ...Shop.heroes,
    ...Shop.snakesSpine,
    ...Shop.laddersSpine,
    ...Shop.heroesSpine,
    ...Shop.heroesSpineBlack,
    ...Shop.dicesSpine,
  ]

  lbGold: Label
  lbGem: Label
  scrollView: ScrollView
  scrollContent: Node
  spineHero: SpineSkeleton
  spriteItem: Sprite
  spriteButton: Sprite
  spriteLand: Sprite
  currentTab = 0
  selectedItemIndex = 0
  shopItems: ShopItem[] = []
  boughtItems: number[] = []

  onLoad() {
    const touchListener = this.node.addComponent(TouchEventRegister, {
      onTouchStart: touch => this.showTouchEffect(touch),
      consumeInput: false,
    })
    touchListener.inputPriority = Number.MAX_SAFE_INTEGER
  }

  preLoad = async () => {
    await loadAll(Shop.allRes)
  }

  destroy() {
    unloadAll(Shop.allRes)
  }

  async onEnter() {
    this.boughtItems = await getItemsBought()
    this.onSelectTab(0)
    this.onClickItem(0)()
    const { profile } = GameState
    this.lbGem.string = `${profile.gem}`
    this.lbGold.string = `${profile.gold}`
  }

  showTouchEffect(touch: Touch) {
    const effect = instantiate(SpineSkeleton, {
      data: sp_touch,
      animation: 'animation',
      loop: false,
      onAnimationComplete: () => effect.node.destroy(),
    })
    effect.node.position = touch.getLocation()
    effect.node.zIndex = 1000
    this.node.addChild(effect.node)
  }

  onPressBack() {
    loadScene(Home)
  }

  resetItems() {
    this.shopItems.forEach((item) => {
      item.unused()
    })
  }

  async onPressSelect() {
    // console.log('select item', this.selectedItemIndex)
    const shopItem = this.shopItems[this.selectedItemIndex]
    const itemId = shopItem.id
    if (shopItem.IsBought) {
      GameState.profile.equipments = await postItemByIdEquip(itemId)
      this.resetItems()
      shopItem.used()
      this.spriteButton.node.active = false
      return
    }
    const { profile, items } = GameState
    const item = items.find(({ id }) => id === itemId)
    if (!item) {
      return
    }
    if (item.priceGold) {
      if (profile.gold < item.priceGold) {
        const warning = createWarningText('Not enough money!')
        warning.node.setPosition(getWinSize().width * 0.5, 500)
        this.node.addChild(warning.node)
        return
      }
      profile.gold -= item.priceGold
      setCoin(profile.gold)
    } else if (item.priceGem) {
      if (profile.gem < item.priceGem) {
        const warning = createWarningText('Not enough gem!')
        warning.node.setPosition(getWinSize().width * 0.5, 500)
        this.node.addChild(warning.node)
        return
      }
      profile.gem -= item.priceGem
      setGem(profile.gem)
    }
    this.boughtItems = await postItemById(itemId)
    shopItem.bought()
    this.spriteButton.spriteFrame = sf_btn_select
  }

  getItems(tab: number) {
    const { profile, items } = GameState
    const equipped = profile.equipments.find(({ slot }) => slot === TabSlot[tab])
    const tabTypes = TabSlot[tab]
    const tabFrames = [Shop.heroes, Shop.dices, Shop.stands, Shop.snakes, Shop.ladder][tab]
    console.log('getItems', tab, tabTypes, tabFrames)
    return items
      .filter(({ type }) => type === tabTypes)
      .map((item, i) => ({
        ...item,
        spriteFrame: tabFrames[i],
        selected: equipped ? equipped.itemId === item.id : i === 0,
      }))
  }

  onSelectTab(tab: number) {
    this.currentTab = tab
    this.scrollContent.removeAllChildren()
    const tabItems = this.getItems(tab)
    const { profile, items } = GameState
    const equipped = profile.equipments.find(({ slot }) => slot === TabSlot[tab])
    console.log('select tab', tab, equipped, items)
    // this.scrollView.props.contentSize.height = Math.ceil(tabItems.length / 3) * 444
    const height = Math.ceil(tabItems.length / 3) * 444
    const { width } = this.scrollView.props.contentSize
    this.scrollView.setInnerContainerSize(Size(width, height))
    this.scrollView.scrollTo(0, 0)
    console.log('.height', height)
    this.shopItems = tabItems.map(({ id, spriteFrame, priceGold, priceGem, selected }, index) => {
      const item = instantiate(ShopItem, { onPress: this.onClickItem(index) })
      item.id = id
      item.spriteIcon.spriteFrame = spriteFrame
      item.setPrice(priceGold, priceGem)
      item.node.setPosition((index % 3) * 345 + 200, Math.floor(index / 3) * 444 + 216)
      item.spriteIcon.node.scale = tab === 2 ? 0.4 : 1
      this.scrollContent.addChild(item.node)
      // item.node.opacity = equipped?.itemId ? 255 : 100
      if (selected) {
        item.used()
      }
      if (index === 0 || !!this.boughtItems.find(({ itemId }) => id === itemId)) {
        item.bought()
      }
      return item
    })
    this.onClickItem(0)()
  }

  getEquippedHeroIndex() {
    const { profile, items } = GameState
    const equipped = profile.equipments.find(({ slot }) => slot === 'hero')
    if (!equipped) return 0
    const heroItems = items.filter(({ type }) => type === 'hero')
    const idx = heroItems.findIndex(({ id }) => id === equipped.itemId)
    return idx >= 0 ? idx : 0
  }

  onClickItem(index: number) {
    return () => {
      console.log('click item', index, this.selectedItemIndex)
      if (this.shopItems[this.selectedItemIndex]) {
        this.shopItems[this.selectedItemIndex].reset()
      }
      this.selectedItemIndex = index
      const item = this.shopItems[index]
      if (item) {
        item.selected()
        this.spriteButton.node.active = !item.IsUsed
        if (item.IsBought) {
          this.spriteButton.spriteFrame = sf_btn_select
        } else {
          this.spriteButton.spriteFrame = sf_btn_buy
        }
      }
      switch (this.currentTab) {
        case 0: {
          this.spineHero.node.active = true
          this.spriteItem.node.active = false
          const data = Shop.heroesSpine[index]
          if (data) {
            this.spineHero.setSkeletonData(data)
          }
          break
        }
        case 1: {
          this.spineHero.node.active = false
          this.spriteItem.node.active = true
          const spriteFrame = Shop.dices[index]
          if (spriteFrame) {
            this.spriteItem.spriteFrame = spriteFrame
          }
          break
        }
        case 2: {
          this.spineHero.node.active = true
          this.spriteItem.node.active = false
          const spriteFrame = Shop.stands[index]
          if (spriteFrame) {
            this.spriteLand.spriteFrame = spriteFrame
          }
          const heroData = Shop.heroesSpine[this.getEquippedHeroIndex()] ?? Shop.heroesSpine[0]
          if (heroData && this.spineHero.props.data !== heroData) {
            this.spineHero.setSkeletonData(heroData)
          }
          break
        }
        case 3: {
          this.spineHero.node.active = true
          this.spriteItem.node.active = false
          const data = Shop.snakesSpine[index]
          if (data) {
            this.spineHero.setSkeletonData(data)
          }
          break
        }
        case 4: {
          this.spineHero.node.active = false
          this.spriteItem.node.active = true
          const spriteFrame = Shop.ladder[index]
          if (spriteFrame) {
            this.spriteItem.spriteFrame = spriteFrame
          }
          break
        }
        default:
          break
      }
    }
  }

  __view() {
    <Scene>
      <Sprite spriteFrame={sf_background_1} node={{ x: 562, y: 1212 }} />
      <Sprite $ref={this.spriteLand} node={{ x: 560, y: 593 }} spriteFrame={sf_s_preview}>
        <SpineSkeleton $ref={this.spineHero} data={sp_hero_1} animation="Idle" node={{ x: -4, y: 72, scale: 2 }} />
        <Sprite $ref={this.spriteItem} spriteFrame={sf_bridge_1} node={{ x: 27, y: 1 }} />
        <Button $ref={this.spriteButton} spriteFrame={sf_btn_select} node={{ x: 20, y: 196 }} onPress={this.onPressSelect} />
      </Sprite>
      <Sprite spriteFrame={sf_rectangle_2} node={{ x: 563, y: 1749 }} />
      <Button spriteFrame={sf_btn_back} node={{ xy: [80, 72] }} onPress={this.onPressBack}>
        <Widget top={0} left={0} inSafeArea={false} />
      </Button>
      <Sprite spriteFrame={sf_ic_gold_bg} node={{ x: 535, y: 98 }}>
        <Label $ref={this.lbGold} node={{ x: 37, y: 3, color: BROWN }} string="1000" size={48} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -61, y: 15 }} />
        <Widget top={50} inSafeArea={false} />
      </Sprite>
      <Sprite spriteFrame={sf_ic_gem_bg} node={{ x: 911, y: 99 }}>
        <Label $ref={this.lbGem} node={{ x: 55, y: 11, color: BROWN }} string="20" size={48} />
        <Sprite spriteFrame={sf_button_add} node={{ x: -41, y: 15 }} />
        <Widget top={50} inSafeArea={false} />
      </Sprite>
      <ScrollView $ref={this.scrollView} contentSize={Size(1100, 420)} viewSize={Size(1100, 920)} node={{ x: 570, y: 1755 }} vertical>
        <Container $refNode={this.scrollContent} node={{ width: 1100, height: 420, anchorX: 0, anchorY: 0 }} />
      </ScrollView>
      <BottomTab onSelectTab={this.onSelectTab} />
    </Scene>
  }
}
