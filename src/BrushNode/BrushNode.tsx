import React from 'react'
import classNames from 'classnames'

import { Node } from '../../lib/beautiful-react-diagrams'
import styles from './BrushNode.module.scss'

const BrushNode = ({ content, inputs, outputs, selected }) => {
  const contentClass = classNames(styles.content, {
    [styles.selected]: selected
  })

  return (
    <div className={styles.node}>
      <div className={styles.ports}>{outputs}</div>
      <div className={contentClass}>{content}</div>
      <div className={styles.ports}>{inputs}</div>
    </div>
  )
}

export default BrushNode as Node['Render']
