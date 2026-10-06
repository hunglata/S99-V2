import { Engine, instantiate, Label, Vec2 } from '@safe-engine/sdl'
import { zipObject } from 'lodash-es'
import FlyingText from '../components/FlyingText'
import { RED } from '../helper/colors'
import Game from '../scene/Game'
import { designedResolution } from '../settings'

function checkValueIsNumberAndParse(value: string | number): number {
  if (typeof value === 'number') {
    return value
  } else if (typeof value === 'string') {
    const parsedValue = parseFloat(value.replace(',', '.'))
    return isNaN(parsedValue) ? undefined : parsedValue
  }
  return undefined
}

function createWarningText(text = '') {
  const label = instantiate(FlyingText)
  this.node.addChild(label.node)
  const { width, height } = designedResolution
  label.node.position = Vec2(width / 2, height / 2)
  label.getComponent(Label).string = text
  label.node.color = RED
  Engine.scene.node.addChild(label.node)
  return label
}

export function test_updateDataFromGoogleSheet() {
  // Init client
  const API_KEY = 'AIzaSyBMKJcSiveu5seLwuE6i00zZPEjPwTR2Zw'
  const SPREADSHEET_ID = '10rOFTO34vzHxKZfivKrYUIh7c1o8cpT26yYNorZg084'

  async function getHeroes() {
    const monstersData = []
    // const heroesData = []
    const mapData: any[] = []
    // const skillsData = []
    {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Monster!A1:F20?key=${API_KEY}`)
      const data = await res.json()
      const tableName = data.values[0]
      for (let index = 1; index < data.values.length; index++) {
        const element = data.values[index].map(checkValueIsNumberAndParse)
        monstersData.push(zipObject(tableName, element))
      }
      console.log('monstersData', JSON.stringify(monstersData))
    }
    {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/World1!A1:H220?key=${API_KEY}`)
      const data = await res.json()
      const tableName = data.values[0]
      const map1DataRaw = []
      for (let index = 1; index < data.values.length; index++) {
        const element = data.values[index].map(checkValueIsNumberAndParse)
        map1DataRaw.push(zipObject(tableName, element))
      }
      map1DataRaw.forEach((lv) => {
        const { stage, type, quantity, layer } = lv
        // console.log(lv);
        const difficultyIndex = stage - 1
        if (!mapData[difficultyIndex]) {
          mapData[difficultyIndex] = { stage, waves: [] }
        }
        mapData[difficultyIndex].waves.push({
          type,
          quantity,
          layer,
        })
      })
      console.log('mapData', JSON.stringify(mapData))
    }
    localStorage.setItem('gameData', JSON.stringify({ monstersData, mapData }))
    return createWarningText('Updated data from Google Sheet')
  }
  return getHeroes()
}

export function test_updateDataFromLocalStorage(gameController: Game) {
  const data = localStorage.getItem('gameData')
  if (data) {
    const gameData = JSON.parse(data)
    // JsonCache.monstersData = gameData.monstersData
    // JsonCache.heroesData = gameData.heroesData
    // JsonCache.skillsData = gameData.skillsData
    // gameController.worldData = { difficulties: gameData.mapData }
    console.log('updateDataFromLocalStorage')
  }
}

export function test_addBuildTimeLabel() {
  const label = instantiate(Label, { string: import.meta.env.BUILD_TIME })
  // console.log('label', label)
  label.node.xy = [498, 32]
  label.node.color = RED
  label.node.zIndex = 1234
  Engine.scene.node.addChild(label.node)
  return label.node
}
