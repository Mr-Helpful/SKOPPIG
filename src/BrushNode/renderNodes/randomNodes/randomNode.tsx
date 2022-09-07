import { RenderNode } from '../renderNode'

const [sY, s0, s1] = [6.022, 12.9898, 43758.5453]
export abstract class RandomNode extends RenderNode {
  private seed: number = 1

  protected random(i: number): number
  protected random(x: number, y: number): number
  protected random(x: number, y?: number) {
    if (y !== undefined) x += sY * (y + 1.0)
    const v = Math.sin(s0 * this.seed * (x + 1.0)) * s1
    return v - Math.floor(v)
  }

  menu() {
    return <div></div>
  }
}
