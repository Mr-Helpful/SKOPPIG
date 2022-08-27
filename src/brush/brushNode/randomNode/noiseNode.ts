import { RandomNode } from '.'

export class NoiseNode extends RandomNode {
  noSources = 0

  renderCPU([], destination) {
    // get dimensions and buffer view on our canvas
    const { width: w, height: h } = destination.canvas
    var idata = destination.createImageData(w, h)
    var buffer32 = new Uint32Array(idata.data.buffer)
    var len = buffer32.length - 1

    // iterate over the image array and write pseudorandom values
    while (len--)
      buffer32[len] = Math.floor(
        this.random(len % w, Math.floor(len / w)) * 256
      )
    destination.putImageData(idata, 0, 0)
  }
}
