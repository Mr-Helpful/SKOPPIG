import styles from './NodeStash.module.scss'
import React from 'react'
import { Node } from '../../lib/beautiful-react-diagrams'
import DiagramNode, {
  DiagramNodeProps
} from '../../lib/beautiful-react-diagrams/Diagram/DiagramNode/DiagramNode'

const callbacks: Omit<DiagramNodeProps, keyof Node> = {
  onDragNewSegment(id, from, to, alignment?) {},
  onMount(id, el) {},
  onNodeClick(ev, node) {},
  onNodeRemove(id, inputs, outputs) {},
  onPortRegister(id, el) {},
  onPositionChange(id, offset) {},
  onSegmentConnect(input, output) {},
  onSegmentFail(id, type) {}
}

interface NodeStashProps {
  nodes: Node[]
}

/** A Temporary store for brush nodes
 * 
[ ] Dragging from stash to diagram
[ ] Dragging from diagram to stash
 */
const NodeStash = ({ nodes }: NodeStashProps) => {
  return (
    <div className={styles.diagramMenu}>
      {nodes.map(({ className = '', ...node }) => {
        className += ' ' + styles.staticNode
        return (
          <DiagramNode
            key={node.id}
            className={className}
            {...node}
            {...callbacks}
          />
        )
      })}
    </div>
  )
}

export default React.memo(NodeStash)
