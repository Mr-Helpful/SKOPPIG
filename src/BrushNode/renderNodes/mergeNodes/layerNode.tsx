import { MergeNode } from './mergeNode'

export class LayerNode extends MergeNode {
  noSources = 2

  renderCPU([upper, lower]) {
    this.ctx.putImageData(lower, 0, 0)
    this.ctx.putImageData(upper, 0, 0)
  }
}
