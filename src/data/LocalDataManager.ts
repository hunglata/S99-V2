import { compress, decompress } from '@amoutonbrady/lz-string'

const GAME_NAME = 'snake-ladder'
const getKeyForGame = (key: string) => `${GAME_NAME}_${key}`

export const getStringForKey = (key: string, defaultValue = ''): string => {
  const value = localStorage.getItem(getKeyForGame(key))
  if (!value) {
    return defaultValue
  }
  return decompress(value)
}

export const setStringForKey = (key: string, value: string) => {
  localStorage.setItem(getKeyForGame(key), compress(value))
}

export const getIntForKey = (key: string, defaultValue: number): number => {
  const value = getStringForKey(key)
  if (!value) {
    return defaultValue
  }
  return parseInt(value, 10)
}

export const setIntForKey = (key: string, value: number) => {
  setStringForKey(key, `${value}`)
}

export const getFloatForKey = (key: string, defaultValue: number): number => {
  const value = getStringForKey(key)
  if (!value) {
    return defaultValue
  }
  return parseFloat(value)
}

export const setFloatForKey = (key: string, value: number) => {
  setStringForKey(key, `${value}`)
}

export function getObjectForKey<T>(key: string, defaultValue: T): T {
  const value = getStringForKey(key)
  if (!value) {
    return defaultValue
  }
  return JSON.parse(value)
}

export function setObjectForKey<T>(key: string, value: T) {
  setStringForKey(key, JSON.stringify(value))
}

export const getBoolForKey = (key: string, defaultValue: boolean): boolean => {
  const value = getStringForKey(key)
  if (!value) {
    return defaultValue
  }
  return value === 'true'
}

export const setBoolForKey = (key: string, value: boolean) => {
  setStringForKey(key, value.toString())
}

export const loadIntArrayForKey = (key: string, defaultValue: Integer[] = []): Integer[] => {
  const value = getStringForKey(key)
  if (!value) {
    return defaultValue
  }
  return value.split(',').map(v => parseInt(v, 10))
}

export const saveIntArrayForKey = (key: string, value: Integer[]) => {
  setStringForKey(key, value.toString())
}
