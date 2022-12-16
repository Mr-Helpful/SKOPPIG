import { MergeNode } from './mergeNode'

export class LayerNode extends MergeNode {
  noSources = 2

  renderCPU([upper, lower]) {
    this.ctx.drawImage(lower, 0, 0)
    this.ctx.drawImage(upper, 0, 0)
  }
}
