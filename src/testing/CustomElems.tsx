export const CustomNode = ({
  id, content, inputs, outputs, data, className
}) => (
  <div className={'bi bi-diagram-node-custom'}>
    <div className={'bi-diagram-ports-custom'}>
      {outputs}
    </div>
    <div className={'bi-diagram-content-custom'}>
      {content}
    </div>
    <div className={'bi-diagram-ports-custom'}>
      {inputs}
    </div>
  </div>
)

export const CustomPort = ({ id, ref, direction, type, className, ...rest }) => {
  return (<div
    className={'bi-diagram-port-custom'}
    ref={ref}
    data-port-id={id}
    {...rest}
  ></div>)
}