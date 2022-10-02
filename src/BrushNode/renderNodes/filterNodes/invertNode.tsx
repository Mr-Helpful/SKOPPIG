import { FilterNode } from './filterNode'

export class InvertNode extends FilterNode {
  constructor(dimensions: [number, number], public percent: number = 100) {
    super(dimensions)
  }

  renderCPU([source]) {
    this.ctx.save()
    this.ctx.filter = `invert(${this.percent}%)`
    this.ctx.putImageData(source, 0, 0)
    this.ctx.restore()
  }
}
