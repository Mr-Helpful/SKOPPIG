import { MergeNode } from './mergeNode'

export class MaskNode extends MergeNode {
  noSources = 2

  renderCPU([mask, layer]) {
    this.ctx.drawImage(mask, 0, 0)
    this.ctx.globalCompositeOperation = 'source-in'
    this.ctx.drawImage(layer, 0, 0)
  }
}
