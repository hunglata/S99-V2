import { sampleSize } from 'lodash-es'
import { ladders, map1, snakes } from '../../network/map'

export function genGifts() {
  const posList: number[] = []
  for (let index = 5; index < map1.length; index++) {
    if (snakes[0][index] || Object.values(snakes[0]).includes(index) || ladders[0][index] || Object.values(ladders[0]).includes(index))
      continue
    posList.push(index)
  }
  return sampleSize(posList, 10)
}
