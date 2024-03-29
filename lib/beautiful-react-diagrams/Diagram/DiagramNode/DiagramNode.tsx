import React, { useEffect, useMemo, useRef } from 'react'
import classNames from 'classnames'
import getDiagramNodeStyle from './getDiagramNodeStyle'
import portGenerator from './portGenerator'
import { useNodeRegistration } from '../../shared/internal_hooks/useContextRegistration'
import useDrag from '../../shared/internal_hooks/useDrag'
import useNodeUnregistration from '../../shared/internal_hooks/useNodeUnregistration'
import { useDiagramMethods } from '../MethodContext/MethodContext'

import {
  defaultContent,
  defaultData,
  defaultPorts,
  defaultSchema,
  Node
} from '../../shared/Types'

const DefaultRender: Node['Render'] = ({ content, inputs, outputs }) => (
  <>
    {content}
    <div className="bi-port-wrapper">
      <div className="bi-input-ports">{inputs}</div>
      <div className="bi-output-ports">{outputs}</div>
    </div>
  </>
)

/**
 * A Diagram Node component displays a single diagram node, handles the drag n drop business logic and fires the
 * related callback. Displays input and output ports if existing and takes care of firing the `onPortRegister` callback
 * when a port is ready (aka rendered),
 */
const DiagramNode = (node: Node) => {
  const {
    // from type Node
    id,
    coordinates,
    selected = false,
    disableDrag = false,
    content = defaultContent,
    inputs = defaultPorts,
    outputs = defaultPorts,
    Render = DefaultRender,
    className = '',
    collapsed = defaultSchema,
    data = defaultData
  } = node

  const methods = useDiagramMethods()
  const ref = useRef<HTMLDivElement>()
  const { onDragStart, onDrag, onDragEnd } = useDrag(ref, {
    throttleBy: 14
  }) // get the drag n drop methods
  const dragStartPoint = useRef(coordinates) // keeps the drag start point in a persistent reference

  if (!disableDrag) {
    // when drag starts, save the starting coordinates into the `dragStartPoint` ref
    onDragStart(event => {
      dragStartPoint.current = coordinates
      methods.config?.onNodeClick(event, node)
    })

    // whilst dragging calculates the next coordinates and perform the `onPositionChange` callback
    onDrag((event, info) => {
      event.nativeEvent.stopImmediatePropagation()
      event.stopPropagation()

      const nextCoords: [number, number] = [
        dragStartPoint.current[0] - info.offset![0],
        dragStartPoint.current[1] - info.offset![1]
      ]
      methods.onNodePositionUpdate(id, nextCoords)
    })
  }

  onDragEnd((event, info) => {
    event.nativeEvent.stopImmediatePropagation()
    event.stopPropagation()
    const offset = info.offset || [0, 0]
    const nextCoords: [number, number] = [
      dragStartPoint.current[0] - offset[0],
      dragStartPoint.current[1] - offset[1]
    ]
    methods.onNodePositionUpdate(id, nextCoords)
  })

  // perform the onMount callback when the node is allowed to register
  useNodeRegistration(ref, (id, el) => methods.onNodeRegister(id, el), id)

  // on component unmount, remove its references
  useNodeUnregistration(
    (id, inputs, outputs) => methods.onNodeRemove(id, inputs, outputs),
    inputs,
    outputs,
    id
  )

  useEffect(() => {
    return methods.config?.onNodeMount?.(node)
  }, [methods.config, node])

  const classList = useMemo(
    () => classNames('bi bi-diagram-node', className),
    [className]
  )

  // generate ports
  const InputPorts = inputs.map(portGenerator('input'))
  const OutputPorts = outputs.map(portGenerator('output'))

  return (
    <div
      key={id}
      className={classList}
      ref={ref}
      style={getDiagramNodeStyle(coordinates, disableDrag)}
    >
      <Render
        id={id}
        content={content}
        inputs={InputPorts}
        outputs={OutputPorts}
        data={data}
        className={className}
        collapsed={collapsed}
        selected={selected}
      />
    </div>
  )
}

export default React.memo(DiagramNode)
