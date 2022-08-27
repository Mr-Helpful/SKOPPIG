import { NodeRender } from '../../lib/beautiful-react-diagrams/shared/Types'
import styles from './CustomElems.module.scss'

export const CustomNode: NodeRender = ({
  content,
  inputs,
  outputs,
  selected
}) => {
  let contentClass = styles.content
  if (selected) contentClass += ` ${styles.selected}`
  return (
    <div className={`${styles.node}`}>
      <div className={styles.ports}>{outputs}</div>
      <div className={contentClass}>{content}</div>
      <div className={styles.ports}>{inputs}</div>
    </div>
  )
}

export const CustomPort = ({
  id,
  ref,
  direction,
  type,
  className,
  ...rest
}) => {
  return (
    <div
      className={'bi-diagram-port-custom'}
      ref={ref}
      data-port-id={id}
      {...rest}
    ></div>
  )
}
