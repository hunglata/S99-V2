import { parseInt } from 'lodash-es'

export const getNowInUnix = () => Math.floor(Date.now() / 1000)

export function getNearestSnake(snakes, cur: number) {
  const sorted = Object.keys(snakes).map(parseInt).reverse()
  for (let index = 0; index < sorted.length; index++) {
    const element = sorted[index]
    if (cur > element) {
      return element
    }
  }
  return 0
}
