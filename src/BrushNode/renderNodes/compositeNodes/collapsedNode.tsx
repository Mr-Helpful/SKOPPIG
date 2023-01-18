import { Schema } from '../../../../lib/beautiful-react-diagrams'
import { RenderEvent, RenderNode } from '..'
import { CompositeNode } from './compositeNode'

export class CollapsedNode extends CompositeNode {
  protected async renderCPU(sources: ImageBitmap[]) {
    // just used the 'compiled' version provided by composite nodes
    this.ctx.drawImage(await this.runSchema(sources, 'cpu'), 0, 0)
  }
}
