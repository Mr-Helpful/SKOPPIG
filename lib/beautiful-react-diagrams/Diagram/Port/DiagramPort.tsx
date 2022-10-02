import React, { HTMLAttributes, useEffect, useMemo, useRef } from 'react'
import classNames from 'classnames'
import useDrag from '../../shared/internal_hooks/useDrag'
import { useCanvas } from '../../Context/DiagramContext'
import getRelativePoint from '../../shared/functions/getRelativePoint'
import { useDiagramMethods } from '../MethodContext/MethodContext'

import { Port, vacuouslyTrue } from '../../shared/Types'

interface DiagramPortProps
  extends Port,
    Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  type: 'input' | 'output'
}

const DiagramPort = ({
  // from type Port
  id,
  canLink = vacuouslyTrue,
  alignment,
  className = '',
  // extra types added to Port
  type,
  ...rest
}: DiagramPortProps) => {
  const methods = useDiagramMethods()
  const canvas = useCanvas()
  const ref = useRef<HTMLDivElement>()
  const { onDragStart, onDrag, onDragEnd } = useDrag(ref)

  onDragStart(event => event.nativeEvent.stopImmediatePropagation())

  onDrag((event, info) => {
    event.nativeEvent.stopImmediatePropagation()
    if (canvas !== null && info.start !== null) {
      event.nativeEvent.stopImmediatePropagation()
      event.stopPropagation()
      const from = getRelativePoint(info.start, [canvas.x, canvas.y])
      const to = getRelativePoint(
        [event.clientX, event.clientY],
        [canvas.x, canvas.y]
      )

      methods.onDragNewSegment({ id, from, to, alignment })
    }
  })

  onDragEnd(event => {
    event.nativeEvent.stopImmediatePropagation()
    const targetPort = (event.target as HTMLElement).getAttribute(
      'data-port-id'
    )
    if (
      targetPort &&
      event.target !== ref.current &&
      canLink(id, targetPort, type)
    ) {
      if (type === 'input') methods.onSegmentConnect(id, targetPort)
      else methods.onSegmentConnect(targetPort, id)
      return
    }
    methods.onSegmentFail()
  })

  useEffect(() => {
    if (ref.current) methods.onPortRegister(id, ref.current)
  }, [id, methods, ref])

  const classList = useMemo(
    () => classNames('bi bi-diagram-port bi-diagram-port-default', className),
    [className]
  )

  return (
    <div className={classList} data-port-id={id} key={id} ref={ref} {...rest} />
  )
}

export default React.memo(DiagramPort)
