interface RenderSource {
  op: string
  sources: (RenderSource | ImageData)[]
  args: any[]
  color: {
    r: number
    g: number
    b: number
  }
  alpha: number
  angle: number
}

/**
 * Renders a single brush image by combining sources
 *
 * @param {Object} src
 *  where to obtain the prior image from
 *  if it is an Object, it recursively generates the brush
 * @param  {...any} args
 *  additional arguments to pass to the function handling the operation
 */
export function Render(src: RenderSource, ...args: any[]) {
  // perform a check whether we are delivering the correct
  // number of sources before peforming the recursive portion
  let noSrcs = src.sources.length
  let opSrcs = Opject[src.op].nSources
  console.assert(
    noSrcs === opSrcs,
    `${src.op} requires ${opSrcs} sources, but ${opSrcs} were given`
  )

  let rendered = src.sources.map(sub => {
    // if it's not anything fancy, recurse and return
    if (!(sub instanceof ImageData)) {
      return Render(sub, ...args)
    }

    const cnv = document.createElement('canvas')
    cnv.width = sub.width
    cnv.height = sub.height

    const ctx = cnv.getContext('2d')!
    ctx.putImageData(sub, 0, 0)
    return ctx
  })

  const destCtx = document.createElement('canvas').getContext('2d')!

  // apply the method to merge the rendered sources
  Opject[src.op].operator(rendered, destCtx, ...src.args, ...args)
  Opject.Color.operator([destCtx], destCtx, src.color)
  Opject.Alpha.operator([destCtx], destCtx, src.alpha)
  Opject.Angle.operator([destCtx], destCtx, src.angle)
  return destCtx
}

interface Operation {
  nSources: number
  operator: (
    srcs: CanvasRenderingContext2D[],
    dest: CanvasRenderingContext2D,
    ...args: any[]
  ) => void
}

interface Operations {
  [name: string]: Operation
}

/** Opject - an object relating operations to functions performing them
 */
let Opject: Operations = {
  Color: {
    nSources: 1,
    operator: function ([src], dest, color) {
      const { width: w, height: h } = src.canvas
      const data = src.getImageData(0, 0, w, h).data
      const { r, g, b } = color

      // Okay, this one's gonna need explanation:
      // I only increment i once in the condition as
      // it's incremented within the body of the loop
      for (let i = 0; i < data.length; i++) {
        // i++ returns the *prior* value of i
        data[i++] = r
        data[i++] = g
        data[i++] = b
      }

      const img = new ImageData(data, w)
      dest.putImageData(img, 0, 0)
    }
  },
  Alpha: {
    nSources: 1,
    operator: function ([src], dest, alpha) {
      const { width: w, height: h } = src.canvas
      const data = src.getImageData(0, 0, w, h).data

      for (let i = 0; i < data.length; i += 4) {
        data[i + 3] *= alpha
      }

      const img = new ImageData(data, w)
      dest.putImageData(img, 0, 0)
    }
  },
  Angle: {
    nSources: 1,
    operator: function ([src], dest, angle) {
      const { width: dw, height: dh } = dest.canvas
      const { width: sw, height: sh } = src.canvas
      const data = src.getImageData(0, 0, sw, sh)
      // we need to copy data before we clear
      dest.clearRect(0, 0, dw, dh)

      // define some constants for the transform matrix
      const c = Math.cos((angle * Math.PI) / 180)
      const s = Math.sin((angle * Math.PI) / 180)
      const x = (dw - sw * c + sh * s) / 2
      const y = (dh - sh * c - sw * s) / 2

      // we use setTransform instead of transform
      // as we're unsure of the current transform applied
      dest.setTransform(c, s, -s, c, x, y)
      dest.putImageData(data, 0, 0)
    }
  },
  Layer: {
    nSources: 2,
    operator: function ([upper, lower], dest) {
      const { width: uw, height: uh } = upper.canvas
      const { width: lw, height: lh } = lower.canvas
      const { width: dw, height: dh } = dest.canvas
      const udata = upper.getImageData(0, 0, uw, uh)
      const ldata = lower.getImageData(0, 0, lw, lh)

      dest.clearRect(0, 0, dw, dh)
      dest.drawImage(lower.canvas, 0, 0)
      dest.drawImage(upper.canvas, 0, 0)
    }
  },
  Mask: {
    nSources: 2,
    operator: function ([image, mask], dest) {}
  }
}
