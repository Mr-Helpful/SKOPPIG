import { FilterNode } from './filterNode'

export class InvertNode extends FilterNode {
  constructor(dimensions: [number, number]) {
    super(dimensions)
  }

  renderCPU([source]) {
    // canvas's invert filter only affects `r,g,b`
    // globalCompositeOperation's difference affects `r,g,b,a`
    // hence using both allows us to invert only the `a` channel
    this.ctx.fillRect(0, 0, ...this.dimensions)
    this.ctx.globalCompositeOperation = 'difference'
    this.ctx.filter = `invert(100%)`
    this.ctx.drawImage(source, 0, 0)
  }
}
