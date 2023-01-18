import { GPU } from 'gpu.js'
import { RiErrorWarningLine } from 'react-icons/ri'
import {
  Coords,
  Node
} from '../../../lib/beautiful-react-diagrams/shared/Types'
import BrushNode from '../BrushNode'
import NodeContent from '../NodeContent'

import styles from './renderNodes.module.scss'

export class RenderError extends Error {
  constructor(renderNode: RenderNode, msg: string) {
    super(msg)
    this.name = `${renderNode.constructor.name}> ${this.constructor.name}`
  }
}

export class RenderEvent extends Event {
  constructor(public img: ImageBitmap | undefined, eventInitDict?: EventInit) {
    super('render', eventInitDict)
  }
}

/** A Class capable of rendering a variety of specialised operations
 * to ImageData and updating upstream nodes with the result
 *
 * @param {[number, number]} dimensions the size of the output ImageData
 * @param {[number, number]} [translation] an optional translation for output
 */
export abstract class RenderNode extends EventTarget {
  private static defaultMode: 'gpu' | 'cpu' = 'gpu'

  /* Declare a single canvas context and GPU instance for all nodes to use */
  private static ctx: CanvasRenderingContext2D
  private static gpu: GPU

  protected readonly ctx: CanvasRenderingContext2D
  protected readonly gpu: GPU

  /* Cache the data resulting from a render */
  protected current?: ImageBitmap = undefined
  get img() {
    return this.current
  }
  fireUpdate() {
    console.groupCollapsed(`${this.constructor.name}> updated`)
    console.log(this.current)
    console.groupEnd()
    this.dispatchEvent(new RenderEvent(this.img))
  }

  /**
   * @param dimensions The width and height of the resulting render
   */
  constructor(public dimensions: [number, number]) {
    super()
    this.ctx ??= RenderNode.ctx ??= document
      .createElement('canvas')
      .getContext('2d')
    this.gpu ??= RenderNode.gpu ??= new GPU({
      canvas: document.createElement('canvas')
    })
  }

  /** how many sources should be provided for a render
   * @note must be implemented
   */
  protected abstract readonly noSources: number

  private _sources: (ImageBitmap | undefined)[]
  private get sources() {
    this._sources ??= new Array(this.noSources).fill(undefined)
    return this._sources
  }

  /*----------------------------------------------------------------
  -                     Node rendering methods                     -
  ----------------------------------------------------------------*/

  /** a fallback rendering method for when gpu rendering
   * is either not possible or not implemented
   * @note should be implemented
   */
  protected async renderCPU?(sources: ImageBitmap[]): Promise<void>

  /** renderGPU can be implemented in the future,
   * but is only really required for fast, compiled code
   * @note can be implemented
   */
  protected async renderGPU?(sources: ImageBitmap[]): Promise<void>

  /** Renders from provided sources, emitting a 'render' event on completion
   *
   * @param mode how to render the node
   */
  async update(mode?: 'gpu' | 'cpu') {
    this.current = await this.render(this.sources, mode)
    this.fireUpdate()
  }

  async render(
    sources: ImageBitmap[],
    mode?: 'gpu' | 'cpu'
  ): Promise<ImageBitmap> {
    mode ??= RenderNode.defaultMode
    const [w, h] = this.dimensions
    this.ctx.clearRect(0, 0, w, h)

    try {
      const index = sources.findIndex(source => source === undefined)
      if (index > -1) throw this.error(`source ${index} is not defined`)

      switch (mode) {
        case 'gpu':
          if (this.renderGPU) {
            this.renderGPU(sources)
            const cnv = this.gpu.canvas
            this.ctx.drawImage(cnv, 0, 0, w, h, 0, 0, w, h)
            break
          }
        case 'cpu':
          if (this.renderCPU) {
            this.ctx.save()
            this.renderCPU(sources)
            this.ctx.restore()
            break
          }
        default:
          throw this.error(`rendering method ${mode} not implemented`)
      }

      let data = this.ctx.getImageData(0, 0, w, h)
      return await createImageBitmap(data)
    } catch (e) {
      // probably want to log errors here or something
      return undefined
    }
  }

  /** Sets a single source for rendering and if necessary, re-renders
   *
   * @param i The index of source to update
   * @param source The ImageData to re-render from
   */
  setSource(i: number, source?: ImageBitmap) {
    if (this.sources[i] === source) return
    // console.log(`${this.constructor.name}> updating source ${i}`)
    this.sources[i] = source
    this.update()
  }

  /*----------------------------------------------------------------
  -                        Settings methods                        -
  ----------------------------------------------------------------*/
  Menu() {
    return (
      <div className={styles.centeredMenu}>
        <RiErrorWarningLine />
        <div>Whoops!</div>
        <div>{"This is the base class for nodes and shouldn't be shown!"}</div>
      </div>
    )
  }

  /*----------------------------------------------------------------
  -                         Diagram methods                        -
  ----------------------------------------------------------------*/
  private static nodeId = 1
  private static linkId = 1

  toNode(coordinates: Coords): Node {
    return {
      id: `node-${RenderNode.nodeId++}`,
      coordinates,
      selected: false,
      content: <NodeContent renderer={this} />,
      inputs: new Array(this.noSources).fill(0).map(_ => ({
        id: `link-${RenderNode.linkId++}`,
        alignment: 'bottom'
      })),
      outputs: [{ id: `link-${RenderNode.linkId++}`, alignment: 'top' }],
      Render: BrushNode,
      data: { instance: this }
    }
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

export const isRenderNode = (obj: any): obj is typeof RenderNode => {
  if (typeof obj !== 'function') return false
  else return obj.prototype instanceof RenderNode
}
