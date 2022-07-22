import { BrushNode } from '../src/brush/brushNode'

interface DAGNode {
  brush: BrushNode
  parents: { [key: number]: boolean }
  children: number[]
  displayed: boolean
}

export class DAGBrush {
  private dag: DAGNode[] = []

  constructor(
    nodes: (BrushNode | DAGNode)[] = []
  ) {
    this.dag = nodes.map(node => {
      if (!(node instanceof BrushNode)) return node
      else return {
        brush: node,
        parents: {},
        children: new Array(node.noSources).fill(-1),
        displayed: false
      }
    })
  }

  /**
   * Creates a link between nodes in the DAG
   * @param i The new parent node
   * @param j The source point on the parent node
   * @param k The new child node for the link
   */
  link(i, j, k) {
    this.dag[i].children[j] = k
    this.dag[k].parents[i] = true
  }

  /**
   * Removes a link between nodes in the DAG
   * @param i The prior parent node
   * @param j The source point on the parent node
   * @param k The prior child node for the link
   */
  unlink(i, j, k) {
    this.dag[i].children[j] = -1
    delete this.dag[k].parents[i]
  }

  /** Select all nodes that **only** contribute to node i */
  selectFrom(i) {
    this.dag.forEach(node => { node.displayed = false })
    this.dag[i].displayed = true

    let queue = [this.dag[i].children]
    while (queue.length) {
      const js = queue.shift()
      for (const j of js) {
        const node = this.dag[j]
        if (!node) continue

        // if all parents have been seen, mark the node seen
        node.displayed = Object.keys(node.parents)
          .every(j => this.dag[j].displayed)
        if (node.displayed) queue.push(node.children)
      }
    }
  }
}