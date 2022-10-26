import { RandomNode } from './randomNode'

export class NoiseNode extends RandomNode {
  noSources = 0

  renderCPU([]) {
    // get dimensions and buffer view on our canvas
    const { width: w, height: h } = this.ctx.canvas
    var idata = this.ctx.createImageData(w, h)
    let pixels = idata.data
    var len = pixels.length

    // iterate over the image array and write pseudorandom values
    while ((len -= 4)) {
      pixels[len - 1] = Math.floor(this.random(len) * 256)
      pixels[len - 2] = pixels[len - 3] = pixels[len - 4] = 0
    }
    this.ctx.putImageData(idata, 0, 0)
  }
}
