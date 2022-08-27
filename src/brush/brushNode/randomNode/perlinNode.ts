import { RandomNode } from '.'

export class PerlinNode extends RandomNode {
  noSources = 0

  renderCPU([], destination) {
    // get dimensions and buffer view on our canvas
    const { width: w, height: h } = destination.canvas
    const idata = destination.createImageData(w, h)
    let buffer32 = new Uint32Array(idata.data.buffer)
    let len = buffer32.length - 1

    // iterate over the image array and write pseudorandom values
    while (len--)
      buffer32[len] = this.perlinFunction(len % w, Math.floor(len / w))
    destination.putImageData(idata, 0, 0)
  }

  private perlinFunction(x: number, y: number): number {
    // Find unit grid cell containing point
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)

    // Get relative xy coordinates of point within that cell
    const dx = x - x0
    const dy = y - y0

    // Declare variables for interpolation calculations
    let A, top, bot
    let t = 1 - dy * dy * dy * (dy * (dy * 6 - 15) + 10)

    // <-- Left edge
    // calulate contributions from top left
    A = this.random(x0, y0) * 2 * Math.PI
    top = Math.cos(A) * dx + Math.sin(A) * dy

    // and bottom left
    A = this.random(x0, y0 + 1) * 2 * Math.PI
    bot = Math.cos(A) * dx + Math.sin(A) * (dy - 1)

    // interpolate on left edge
    const left = (1 - t) * bot + t * top
    // -->

    // <-- Right edge
    // calulate contributions from top right
    A = this.random(x0 + 1, y0) * 2 * Math.PI
    top = Math.cos(A) * (dx - 1) + Math.sin(A) * dy

    // and bottom right
    A = this.random(x0 + 1, y0 + 1) * 2 * Math.PI
    bot = Math.cos(A) * (dx - 1) + Math.sin(A) * (dy - 1)

    // interpolate on right edge
    const right = (1 - t) * bot + t * top
    // -->

    // interpolate whole box
    t = dx * dx * dx * (dx * (dx * 6 - 15) + 10)
    t = (1 - t) * left + t * right
    return Math.floor(t * 256)
  }
}
