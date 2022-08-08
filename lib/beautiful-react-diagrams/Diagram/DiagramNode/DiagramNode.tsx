import React, { useMemo, useRef } from 'react'
import classNames from 'classnames'
import getDiagramNodeStyle from './getDiagramNodeStyle'
import portGenerator from './portGenerator'
import {
  usePortRegistration,
  useNodeRegistration
} from '../../shared/internal_hooks/useContextRegistration'
import useDrag from '../../shared/internal_hooks/useDrag'
import useNodeUnregistration from '../../shared/internal_hooks/useNodeUnregistration'
import {
  defaultContent,
  defaultData,
  defaultPorts,
  Node,
  PortAlignment
} from '../../shared/Types'

interface DiagramNodeProps extends Node {
  /** The callback to be fired when position changes */
  onPositionChange: (id: string, offset: [number, number]) => void
  /** The callback to be fired when a new port is settled */
  onPortRegister: (id: string, el: HTMLElement) => void
  /** The callback to be fired when component unmount */
  onNodeRemove: (id: string, inputs: string[], outputs: string[]) => void
  /** The callback to be fired when dragging a new segment from one of the node's port */
  onDragNewSegment: (
    id: string,
    from: [number, number],
    to: [number, number],
    alignment: PortAlignment
  ) => void
  /** The callback to be fired when a new diagram is mounted */
  onMount: (id: string, el: HTMLElement) => void
  /** The callback to be fired when a new segment fails to connect */
  onSegmentFail: (id: string, type: 'input' | 'output') => void
  /** The callback to be fired when a new segment connects to a port */
  onSegmentConnect: (input: string, output: string) => void
  /** The callback to be fired when a node is selected */
  onNodeSelect: (id: string) => void
}

/**
 * A Diagram Node component displays a single diagram node, handles the drag n drop business logic and fires the
 * related callback. Displays input and output ports if existing and takes care of firing the `onPortRegister` callback
 * when a port is ready (aka rendered),
 */
const DiagramNode = ({
  // from type Node
  id,
  coordinates,
  selected = false,
  disableDrag = false,
  content = defaultContent,
  inputs = defaultPorts,
  outputs = defaultPorts,
  type = 'default',
  render = undefined,
  className = '',
  data = defaultData,
  // callbacks from parents
  onPositionChange,
  onPortRegister,
  onNodeRemove,
  onDragNewSegment,
  onMount,
  onSegmentFail,
  onSegmentConnect,
  onNodeSelect
}: DiagramNodeProps) => {
  const clickSensitivity = 5
  const registerPort = usePortRegistration(inputs, outputs, onPortRegister) // get the port registration method
  const { ref, onDragStart, onDrag, onDragEnd } = useDrag<HTMLDivElement>({
    throttleBy: 14
  }) // get the drag n drop methods
  const triggerClick = useRef(false) // whether a node has been move little enough to consider this a click event
  const dragStartPoint = useRef(coordinates) // keeps the drag start point in a persistent reference

  if (!disableDrag) {
    // when drag starts, save the starting coordinates into the `dragStartPoint` ref
    onDragStart(() => {
      dragStartPoint.current = coordinates
      triggerClick.current = true
    })

    // whilst dragging calculates the next coordinates and perform the `onPositionChange` callback
    onDrag((event, info) => {
      if (onPositionChange) {
        event.stopImmediatePropagation()
        event.stopPropagation()
        const [ox, oy] = info.offset
        const dist = ox * ox + oy * oy
        if (dist > clickSensitivity * clickSensitivity)
          triggerClick.current = false

        const nextCoords: [number, number] = [
          dragStartPoint.current[0] - info.offset[0],
          dragStartPoint.current[1] - info.offset[1]
        ]
        onPositionChange(id, nextCoords)
      }
    })
  }

  onDragEnd((event, info) => {
    if (onPositionChange) {
      event.stopImmediatePropagation()
      event.stopPropagation()
      const offset = info.offset || [0, 0]
      const nextCoords: [number, number] = [
        dragStartPoint.current[0] - offset[0],
        dragStartPoint.current[1] - offset[1]
      ]
      onPositionChange(id, nextCoords)
      if (triggerClick.current) onNodeSelect(id)
    }
  })

  // on component unmount, remove its references
  useNodeUnregistration(onNodeRemove, inputs, outputs, id)

  // perform the onMount callback when the node is allowed to register
  useNodeRegistration(ref, onMount, id)

  const classList = useMemo(
    () =>
      classNames(
        'bi bi-diagram-node',
        {
          [`bi-diagram-node-${type}`]: !!type && !render
        },
        className
      ),
    [type, render, className]
  )

  // generate ports
  const options = {
    registerPort,
    onDragNewSegment,
    onSegmentFail,
    onSegmentConnect
  }
  const InputPorts = inputs.map(portGenerator(options, 'input'))
  const OutputPorts = outputs.map(portGenerator(options, 'output'))
  const customRenderProps = {
    id,
    content,
    type,
    inputs: InputPorts,
    outputs: OutputPorts,
    data,
    className,
    selected
  }

  return (
    <div
      key={id}
      className={classList}
      ref={ref}
      style={getDiagramNodeStyle(coordinates, disableDrag)}
    >
      {render && typeof render === 'function' && render(customRenderProps)}
      {!render && (
        <>
          {content}
          <div className="bi-port-wrapper">
            <div className="bi-input-ports">{InputPorts}</div>
            <div className="bi-output-ports">{OutputPorts}</div>
          </div>
        </>
      )}
    </div>
  )
}

export default React.memo(DiagramNode)
