import {
  RiDeleteBin2Fill, RiArrowUpSLine, RiArrowDownSLine, RiNodeTree
} from 'react-icons/ri'
import { NodeRender } from '../beautiful-react-diagrams/shared/Types'
import styles from './CustomElems.module.scss'

export const CustomNode: NodeRender = ({
  id, content, inputs, outputs, data
}) => {
  let contentClass = styles.content
  if (data.selected) contentClass += ` ${styles.selected}`
  return (
    <div className={`${styles.bi} ${styles.node}`}>
      <div className={styles.ports}>
        {outputs}
      </div>
      <div className={styles.body}>
        <div className={contentClass}>
          {content}
        </div>
        <div className={styles.menu}>
          <RiDeleteBin2Fill onClick={() => data.deleteNode(id)} />
          <RiArrowUpSLine onClick={() => data.collapse(id)} />
          <RiArrowDownSLine onClick={() => data.expand(id)} />
          <RiNodeTree onClick={() => data.selectCollapsible(id)} />
        </div>
      </div>
      <div className={styles.ports}>
        {inputs}
      </div>
    </div>
  );
}

export const CustomPort = ({ id, ref, direction, type, className, ...rest }) => {
  return (<div
    className={'bi-diagram-port-custom'}
    ref={ref}
    data-port-id={id}
    {...rest}
  ></div>)
}