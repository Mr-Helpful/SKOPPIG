import { SourceNode } from '.'

export class ImageNode extends SourceNode {
  src: CanvasImageSource | undefined = undefined

  renderCPU([], destination) {
    if (this.src === undefined) throw new Error("src must be provided")
    destination.putImageData(this.src, 0, 0)
  }
}