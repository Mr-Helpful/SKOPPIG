import { RandomNode } from './randomNode'

// some random constants to ensure that x, y coordinates
// are extremely unlikely to lie on integer coordinates
// as this will lead to a blank image being generated
const [ox, oy, s] = [0.2495305, 0.1010992, 1.06925175]

export class PerlinNode extends RandomNode {
  noSources = 0

  protected scale: number = 10

  renderCPU([]) {
    // get dimensions and buffer view on our canvas
    const { width: w, height: h } = this.ctx.canvas
    var idata = this.ctx.createImageData(w, h)
    let pixels = idata.data
    var len = pixels.length

    // iterate over the image array and write pseudorandom values
    while ((len -= 4)) {
      const l = len / 4
      const [x, y] = [l % w, Math.floor(l / w)].map(v => v / this.scale)
      pixels[len - 1] = this.perlinFunction(s * (x + ox), s * (y + oy))
      pixels[len - 2] = pixels[len - 3] = pixels[len - 4] = 0
    }
    this.ctx.putImageData(idata, 0, 0)
  }

  private perlinFunction(x: number, y: number): number {
    // Find unit grid cell containing point
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)

    // Get relative xy coordinates of point within that cell
    const dx = x - x0
    const dy = y - y0

    // Declare variables for interpolation calculations
    let A: number, top: number, bot: number
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
