import { SourceNode } from '.'

export class ImageNode extends SourceNode {
  src: ImageData | undefined = undefined

  renderCPU([], destination: CanvasRenderingContext2D) {
    if (this.src === undefined) throw new Error("src must be provided")
    destination.putImageData(this.src, 0, 0)
  }
}