import { RandomNode } from './randomNode'

export class NoiseNode extends RandomNode {
  noSources = 0

  renderCPU([]) {
    // get dimensions and buffer view on our canvas
    const { width: w, height: h } = this.ctx.canvas
    var idata = this.ctx.createImageData(w, h)
    var buffer32 = new Uint32Array(idata.data.buffer)
    var len = buffer32.length - 1

    // iterate over the image array and write pseudorandom values
    while (len--) buffer32[len] = Math.floor(this.random(len) * 256)
    this.ctx.putImageData(idata, 0, 0)
  }
}
