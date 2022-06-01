import { useContext } from "react"
import { SchemaContext } from "../dagRender/Context/SchemaContext"

export const CustomNode = ({
  id, content, inputs, outputs, data, className
}) => {
  const schema = useContext(SchemaContext)
  let contentClass = 'bi-diagram-content-custom'
  if (data.selected) contentClass += ' bi-diagram-content-selected'
  return (
    <div
      className={'bi bi-diagram-node-custom'}
      onDoubleClick={() => data.onClick(id, schema)}
    >
      <div className={'bi-diagram-ports-custom'}>
        {outputs}
      </div>
      <div className={contentClass}>
        {content}
      </div>
      <div className={'bi-diagram-ports-custom'}>
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