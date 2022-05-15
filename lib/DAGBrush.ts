import { BrushNode } from '../src/brush/brushNode'

interface DAGNode {
  brush: BrushNode
  parents: { [key: number]: boolean }
  children: number[]
  seen: boolean
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
        seen: false
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

  unlink(i, j, k) {
    this.dag[i].children[j] = -1
    delete this.dag[k].parents[i]
  }

  /** Select all nodes that **only** contribute to node i */
  selectFrom(i) {
    this.dag.forEach(node => { node.seen = false })
    this.dag[i].seen = true

    let queue = [this.dag[i].children]
    while (queue.length) {
      const js = queue.shift()
      for (const j of js) {
        const node = this.dag[j]
        if (!node) continue

        // if all parents have been seen, mark the node seen
        node.seen = Object.keys(node.parents)
          .every(j => this.dag[j].seen)
        if (node.seen) queue.push(node.children)
      }
    }
  }
}