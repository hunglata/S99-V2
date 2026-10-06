declare type Float = number
declare type Integer = number
declare let firebase: any

interface HMR {
  accept: (cb?: () => void) => void
  dispose: (cb?: () => void) => void
}

declare namespace module {
  const hot: HMR
}

declare let process: Process

type SheetItem = {
  id: number
  type?: EquipSlot
  priceGold?: number
  priceGem?: number
  oneTime: boolean
}
