import styles from 'NodeStash.module.scss'

/** A Temporary store for brush nodes
 * 
[ ] Dragging from stash to diagram
[ ] Dragging from diagram to stash
 */

export const NodeStash = () => {
  return (
    <div className={styles.diagramMenu} draggable>
      Maybe draggable
    </div>
  )
}
