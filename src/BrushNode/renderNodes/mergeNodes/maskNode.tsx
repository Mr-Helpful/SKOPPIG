import { MergeNode } from './mergeNode'

export class MaskNode extends MergeNode {
  noSources = 2

  renderCPU([mask, layer]) {
    this.ctx.save()
    this.ctx.putImageData(mask, 0, 0)
    this.ctx.globalCompositeOperation = 'source-in'
    this.ctx.putImageData(layer, 0, 0)
    this.ctx.restore()
  }
}
