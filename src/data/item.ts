import { loadJsonAsset } from '@safe-engine/sdl'
import { items_json } from '../assets'
import { getBoughtItems, getEquipments, setBoughtItems, setEquipments } from './GameDataManager'

export async function getItems() {
  const data = await loadJsonAsset<SheetItem[]>(items_json)
  return data
}

export async function getItemsBought() {
  return getBoughtItems()
}

export async function getItemById(id: number) {
  const items = await getItems()
  const data = items.find(item => item.id === id)
  return data
}

export async function postItemById(id: number) {
  const boughtItems = getBoughtItems()
  if (!boughtItems.includes(id)) {
    boughtItems.push(id)
    setBoughtItems(boughtItems)
  }
  return boughtItems
}

export async function postItemByIdEquip(id: number) {
  const equipments = getEquipments()
  const item = await getItemById(id)
  if (!item) {
    throw new Error('Item not found or not equipment')
  }
  const equipmentIndex = equipments.findIndex(({ slot }) => slot === item.type)
  const equipment = { slot: item.type, itemId: id }
  if (equipmentIndex >= 0) {
    equipments[equipmentIndex] = equipment
  } else {
    equipments.push(equipment)
  }
  setEquipments(equipments)
  return equipments
}
