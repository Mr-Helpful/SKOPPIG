import { BrushNode } from '..'

export abstract class RandomNode extends BrushNode {
  seed: number = 0
  random(x: number, y: number): number {
    let result = Math.sin(
      12.9898 * this.seed * (x + 1.0) +
      78.233 * this.seed * (y + 1.0)) * 43758.5453
    return result - Math.floor(result)
  }
}

export { NoiseNode } from './noiseNode'
export { PerlinNode } from './perlinNode'