import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import useDrag from '../../shared/internal_hooks/useDrag'
import useCanvas from '../../shared/internal_hooks/useCanvas'
import getRelativePoint from '../../shared/functions/getRelativePoint'

/**
 * Port
 * @param props
 * @returns {*}
 * @constructor
 */
const Port = (props) => {
  const { id, canLink, alignment, render, onDragNewSegment, onSegmentFail, onSegmentConnect, onMount, type, className, ...rest } = props
  const canvas = useCanvas()
  const { ref, onDrag, onDragEnd } = useDrag()

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
    const targetPort = (event.target as HTMLElement)
      .getAttribute('data-port-id')
    if (targetPort && event.target !== ref.current && canLink(id, targetPort, type) && onSegmentConnect) {
      const args = type === 'input' ? [id, targetPort, type] : [targetPort, id, type]

      onSegmentConnect(...args)
      return
    }
    /* eslint-disable no-unused-expressions */
    onSegmentFail && onSegmentFail(id, type)
    /* eslint-enable no-unused-expressions */
  })

  useEffect(() => {
    if (ref.current && onMount) {
      onMount(id, ref.current)
    }
  }, [id, onMount, ref])

  const classList = useMemo(() => classNames('bi bi-diagram-port', {
    ['bi-diagram-port-default']: !render,
  }, className), [className, render])
  const customRenderProps = { ref, id, direction: alignment, type, className }

  if (render && typeof render === 'function') return render(customRenderProps)
  else return <div
    className={classList} data-port-id={id} key={id} ref={ref} {...rest}
  />
}

Port.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.symbol]).isRequired,
  type: PropTypes.oneOf(['input', 'output']).isRequired,
  render: PropTypes.func,
  onDragNewSegment: PropTypes.func,
  onSegmentFail: PropTypes.func,
  onSegmentConnect: PropTypes.func,
  canLink: PropTypes.func,
  onMount: PropTypes.func,
  alignment: PropTypes.oneOf(['right', 'left', 'top', 'bottom']),
}

Port.defaultProps = {
  render: undefined,
  onDragNewSegment: undefined,
  onSegmentFail: undefined,
  onSegmentConnect: undefined,
  canLink: () => true,
  onMount: undefined,
  alignment: undefined,
}

export default React.memo(Port)
