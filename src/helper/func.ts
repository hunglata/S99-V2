import { instantiate, Vec2 } from '@safe-engine/sdl';
import FlyingText from '../components/FlyingText';
import { RED } from './colors';

export function SizeToVec2(winSize: Size): Vec2 {
  return Vec2(winSize.width, winSize.height)
}

export function createWarningText(text = '') {
  const flying = instantiate(FlyingText)
  flying.label.string = text
  flying.node.color = RED
  return flying
}
