import {
  getBoolForKey,
  getIntForKey,
  getObjectForKey,
  getStringForKey,
  loadIntArrayForKey,
  saveIntArrayForKey,
  setBoolForKey,
  setIntForKey,
  setStringForKey,
} from './LocalDataManager'

const HIGHEST_LEVEL = 'HIGHEST_LEVEL'
export function getHighestLevel(): Integer {
  return getIntForKey(HIGHEST_LEVEL, 1)
}
export function setHighestLevel(highestLevel: Integer) {
  setIntForKey(HIGHEST_LEVEL, highestLevel)
}

const EFFECT = 'EFFECT'
export function getEffect(): boolean {
  return getBoolForKey(EFFECT, true)
}
export function setEffect(effect: boolean) {
  setBoolForKey(EFFECT, effect)
}

const MUSIC = 'MUSIC'
export function getMusic(): boolean {
  return getBoolForKey(MUSIC, true)
}
export function setMusic(music: boolean) {
  setBoolForKey(MUSIC, music)
}

const ACCESS_TOKEN = 'ACCESS_TOKEN'
export function getAccessToken(): string {
  return getStringForKey(ACCESS_TOKEN, '')
}
export function setAccessToken(accessToken: string) {
  setStringForKey(ACCESS_TOKEN, accessToken)
}

const REFRESH_TOKEN = 'REFRESH_TOKEN'
export function getRefreshToken(): string {
  return getStringForKey(REFRESH_TOKEN, '')
}
export function setRefreshToken(refreshToken: string) {
  setStringForKey(REFRESH_TOKEN, refreshToken)
}

const USER_ID = 'USER_ID'
export function getUserId(): string {
  return getStringForKey(USER_ID, '')
}
export function setUserId(userId: string) {
  setStringForKey(USER_ID, userId)
}

const COIN = 'COIN'
export function getCoin(): Integer {
  return getIntForKey(COIN, 0)
}
export function setCoin(coin: Integer) {
  setIntForKey(COIN, coin)
}

const GEM = 'GEM'
export function getGem(): Integer {
  return getIntForKey(GEM, 0)
}
export function setGem(gem: Integer) {
  setIntForKey(GEM, gem)
}

const EQUIPMENTS = 'EQUIPMENTS'
export function getEquipments() {
  return getObjectForKey<{ slot: string, itemId: number }[]>(EQUIPMENTS, [])
}
export function setEquipments(equipments: { slot: string, itemId: number }[]) {
  setStringForKey(EQUIPMENTS, JSON.stringify(equipments))
}
const INVENTORY = 'INVENTORY'
export function getBoughtItems() {
  return loadIntArrayForKey(INVENTORY)
}
export function setBoughtItems(boughtItems: Integer[]) {
  saveIntArrayForKey(INVENTORY, boughtItems)
}
