import { RenderNode } from '../renderNode'

export abstract class FilterNode extends RenderNode {
  noSources = 1

  Menu() {
    return <div></div>
  }
}
