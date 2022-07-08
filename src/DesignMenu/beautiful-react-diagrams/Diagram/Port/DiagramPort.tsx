import React, { HTMLAttributes, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import useDrag from '../../shared/internal_hooks/useDrag'
import useCanvas from '../../shared/internal_hooks/useCanvas'
import getRelativePoint from '../../shared/functions/getRelativePoint'
import { Port, PortAlignment } from '../../shared/Types'

interface DiagramPortProps extends Port, Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  onMount: (id: string, el: HTMLElement) => void
  onDragNewSegment: (id: string, from: [number, number], to: [number, number], alignment: PortAlignment) => void
  onSegmentFail: (id: string, type: 'input' | 'output') => void
  onSegmentConnect: (input: string, output: string, type: 'input' | 'output') => void
  type: 'input' | 'output'
}

/**
 * Port
 * @param props
 * @returns {*}
 * @constructor
 */
const DiagramPort = (props: DiagramPortProps) => {
  const { id, canLink, alignment, onDragNewSegment, onSegmentFail, onSegmentConnect, onMount, type, className, ...rest } = props
  const canvas = useCanvas()
  const { ref, onDrag, onDragEnd } = useDrag<HTMLDivElement>()

  onDrag((event, info) => {
    if (onDragNewSegment) {
      event.stopImmediatePropagation()
      event.stopPropagation()
      const from = getRelativePoint(info.start, [canvas.x, canvas.y])
      const to = getRelativePoint([event.clientX, event.clientY], [canvas.x, canvas.y])

      onDragNewSegment(id, from, to, alignment)
    }
  })

  onDragEnd((event) => {
    const targetPort = (event.target as HTMLElement).getAttribute('data-port-id')
    if (targetPort && event.target !== ref.current && canLink(id, targetPort, type) && onSegmentConnect) {
      if (type === 'input') onSegmentConnect(id, targetPort, type)
      else onSegmentConnect(targetPort, id, type)
      return
    }
    if (onSegmentFail) onSegmentFail(id, type)
  })

  useEffect(() => {
    if (ref.current && onMount) {
      onMount(id, ref.current)
    }
  }, [id, onMount, ref])

  const classList = useMemo(() => classNames('bi bi-diagram-port bi-diagram-port-default', className), [className])

  return <div
    className={classList} data-port-id={id} key={id} ref={ref} {...rest}
  />
}

DiagramPort.defaultProps = {
  onDragNewSegment: undefined,
  onSegmentFail: undefined,
  onSegmentConnect: undefined,
  canLink: () => true,
  onMount: undefined,
  alignment: undefined,
}

export default React.memo(DiagramPort)
