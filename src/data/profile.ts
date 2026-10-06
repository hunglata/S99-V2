import { getCoin, getEquipments, getGem } from './GameDataManager'

export async function getProfiles() {
  const data: Profile = {
    id: '1',
    name: 'Chicky',
    equipments: getEquipments(),
    gem: getGem(),
    gold: getCoin(),
  }
  return data
}

export async function getProfileById(id: string) {
  const data: PublicProfile = {
    name: 'AI Bot',
    equipments: [],
  }
  return data
}
