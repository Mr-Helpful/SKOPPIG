import React from 'react'

import { Node } from '../../lib/beautiful-react-diagrams'
import styles from './BrushNode.module.scss'

const BrushNode = ({ content, inputs, outputs, selected }) => {
  let contentClass = styles.content
  if (selected) contentClass += ` ${styles.selected}`

  return (
    <div className={styles.node}>
      <div className={styles.ports}>{outputs}</div>
      <div className={contentClass}>{content}</div>
      <div className={styles.ports}>{inputs}</div>
    </div>
  )
}

export default BrushNode as Node['render']
