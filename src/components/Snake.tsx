import { BaseComponentProps, ComponentX, SpineBonesControl, SpineSkeleton } from '@safe-engine/sdl'
import { sp_snake_1 } from '../assets'

interface SnakeProps extends BaseComponentProps<Snake> {
  headPos: Vec2
  bodyPos: Vec2
  tailPos: Vec2
}

export default class Snake extends ComponentX<SnakeProps> {
  spineSkeleton: SpineSkeleton

  start() { }

  __view() {
    <SpineSkeleton $ref={this.spineSkeleton} data={sp_snake_1}>
      <SpineBonesControl
        bones={[
          ['dau ran', this.props.headPos.x, this.props.headPos.y],
          ['panel than ran', this.props.bodyPos.x, this.props.bodyPos.y],
          ['panel duoi ran', this.props.tailPos.x, this.props.tailPos.y],
        ]}
      />
    </SpineSkeleton>
  }
}
