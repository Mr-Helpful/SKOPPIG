import { SourceNode } from './sourceNode'

export class ImageNode extends SourceNode {
  constructor(dimensions: [number, number], public src?: CanvasImageSource) {
    super(dimensions)
  }

  renderCPU([]) {
    if (this.src === undefined) this.error('src must be provided')
    this.ctx.drawImage(this.src, 0, 0)
  }
}
