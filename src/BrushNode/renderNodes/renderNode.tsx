import { GPU } from 'gpu.js'
import { render } from 'react-dom'
import { RiErrorWarningLine, RiImage2Line } from 'react-icons/ri'
import { EventEmitter } from 'stream'

import styles from './renderNodes.module.scss'

// a default SVG path to draw upon failure
const container = document.createElement('div')
render(<RiImage2Line />, container)
const pathElem = container.querySelectorAll('path')[1]
const failurePath = new Path2D(pathElem.getAttribute('d'))

export class RenderError extends Error {
  constructor(renderNode: RenderNode, msg: string) {
    super(msg)
    this.name = `${renderNode.constructor.name}> ${this.constructor.name}`
  }
}

/** A Class capable of rendering a variety of specialised operations
 * to ImageData and updating upstream nodes with the result
 *
 * @param {[number, number]} dimensions the size of the output ImageData
 * @param {[number, number]} [translation] an optional translation for output
 */
export abstract class RenderNode extends EventEmitter {
  /* Declare a single canvas context and GPU instance for all nodes to use */
  protected readonly ctx = document.createElement('canvas').getContext('2d')
  protected readonly gpu = new GPU({
    canvas: document.createElement('canvas')
  })

  /**
   * @param dimensions The width and height of the resulting render
   */
  constructor(public dimensions: [number, number]) {
    super()
  }

  /** how many sources should be provided for a render
   * @note must be implemented
   */
  protected abstract readonly noSources: number

  private _sources: (ImageData | undefined)[] = []
  private get sources() {
    if (this._sources === undefined) {
      this._sources = new Array(this.noSources).fill(undefined)
    }
    return this._sources
  }

  /*----------------------------------------------------------------
  -                     Node rendering methods                     -
  ----------------------------------------------------------------*/

  /** a fallback rendering method for when gpu rendering
   * is either not possible or not implemented
   * @note should be implemented
   */
  protected renderCPU?(sources: ImageData[]): void

  /** renderGPU can be implemented in the future,
   * but is only really required for fast, compiled code
   * @note can be implemented
   */
  protected renderGPU?(sources: ImageData[]): void

  /** Renders from provided sources, emitting a 'render' event on completion
   *
   * @param mode how to render the node
   */
  render(mode: 'gpu' | 'cpu' = 'gpu') {
    const [w, h] = this.dimensions
    this.ctx.clearRect(0, 0, w, h)

    try {
      const undef = this.sources.findIndex(source => source === undefined)
      if (undef > -1) throw this.error(`source ${undef} is not defined`)

      switch (mode) {
        case 'gpu':
          if (this.renderGPU) {
            this.renderGPU(this.sources)
            const cnv = this.gpu.canvas
            this.ctx.drawImage(cnv, 0, 0, w, h, 0, 0, w, h)
            break
          }
        case 'cpu':
          if (this.renderCPU) {
            this.renderCPU(this.sources)
            break
          }
        default:
          throw this.error(`rendering method ${mode} not implemented`)
      }

      this.emit('render', this.ctx.getImageData(0, 0, w, h))
    } catch (e) {
      this.emit('error', e)
      this.emit('render', undefined)
    }
  }

  /** Sets a single source for rendering and if necessary, re-renders
   *
   * @param i The index of source to update
   * @param source The ImageData to re-render from
   */
  setSource(i: number, source?: ImageData) {
    if (this.sources[i] === source) return
    this.sources[i] = source
    this.render()
  }

  /*----------------------------------------------------------------
  -                        Settings methods                        -
  ----------------------------------------------------------------*/
  menu() {
    return (
      <div className={styles.centeredMenu}>
        <RiErrorWarningLine />
        <div>Whoops!</div>
        <div>{"This is the base class for nodes and shouldn't be shown!"}</div>
      </div>
    )
  }

  /*----------------------------------------------------------------
  -                        Utility methods                         -
  ----------------------------------------------------------------*/
  /** Creates an error for the current render node */
  error(msg) {
    return new RenderError(this, msg)
  }

  /** Converts from an index to x, y coordinates */
  fromIndex(i: number, w: number): [number, number] {
    return [i % w, Math.floor(i / w)]
  }

  /** Converts from x, y coordinates to an index */
  toIndex([x, y]: [number, number], w: number): number {
    return x + w * y
  }
}
