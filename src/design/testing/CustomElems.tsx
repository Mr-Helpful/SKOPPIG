import { RiDeleteBin2Fill, RiArrowUpSLine, RiNodeTree } from 'react-icons/ri'
import { NodeRender } from '../beautiful-react-diagrams/shared/Types-ts'

export const CustomNode: NodeRender = ({
  id, content, inputs, outputs, data
}) => {
  let contentClass = 'custom-content'
  if (data.selected) contentClass += ' selected'
  return (
    <div className={'bi custom-node'}>
      <div className={'custom-ports'}>
        {outputs}
      </div>
      <div className={'custom-body'}>
        <div className={contentClass}>
          {content}
        </div>
        <div className={'custom-menu'}>
          <RiDeleteBin2Fill onClick={() => data.deleteNode(id)} />
          <RiArrowUpSLine onClick={() => data.selectCollapsible(id)} />
          <RiNodeTree onClick={() => data.selectChildren(id)} />
        </div>
      </div>
      <div className={'custom-ports'}>
        {inputs}
      </div>
    </div>
  )
}

export const CustomPort = ({ id, ref, direction, type, className, ...rest }) => {
  return (<div
    className={'bi-diagram-port-custom'}
    ref={ref}
    data-port-id={id}
    {...rest}
  ></div>)
}