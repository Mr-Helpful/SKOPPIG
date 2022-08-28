import styles from 'NodeStash.module.scss'
import React from 'react'

/** A Temporary store for brush nodes
 * 
[ ] Dragging from stash to diagram
[ ] Dragging from diagram to stash
 */

const NodeStash = () => {
  return (
    <div className={styles.diagramMenu} draggable>
      Maybe draggable
    </div>
  )
}

export default React.memo(NodeStash)
