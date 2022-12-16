import { FilterNode } from './filterNode'

export class BlurNode extends FilterNode {
  constructor(dimensions: [number, number], public size: number = 3) {
    super(dimensions)
  }

  renderCPU([source]) {
    this.ctx.filter = `blur(${this.size}px)`
    this.ctx.drawImage(source, 0, 0)
  }
}
