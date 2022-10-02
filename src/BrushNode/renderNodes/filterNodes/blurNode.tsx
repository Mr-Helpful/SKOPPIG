import { FilterNode } from './filterNode'

export class BlurNode extends FilterNode {
  constructor(dimensions: [number, number], public size: number = 3) {
    super(dimensions)
  }

  renderCPU([source]) {
    this.ctx.save()
    this.ctx.filter = `blur(${this.size})`
    this.ctx.putImageData(source, 0, 0)
    this.ctx.restore()
  }
}
