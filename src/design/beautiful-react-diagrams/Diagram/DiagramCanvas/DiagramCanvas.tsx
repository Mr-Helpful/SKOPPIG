import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { useWindowScroll, useWindowResize } from 'beautiful-react-hooks'
import DiagramCanvasProps from 'prop-types'
import classNames from 'classnames'
import DiagramContext, { ElementObject } from '../../Context/DiagramContext'

interface DiagramCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  portRefs: ElementObject
  nodeRefs: ElementObject
  className?: string
}

/**
 * The DiagramCanvas component provides a context to the Diagram children.
 * The context contains the canvas bounding box (for future calculations) and the port references in order to
 * allow links to easily access to a the ports coordinates
 */
const DiagramCanvas = ({
  children, portRefs, nodeRefs, className, ...rest
}: DiagramCanvasProps) => {
  const [bbox, setBoundingBox] = useState<DOMRect>(null)
  const canvasRef = useRef<HTMLDivElement>()
  const classList = classNames('bi bi-diagram', className)

  // calculate the given element bounding box and save it into the bbox state
  const calculateBBox = (el: HTMLElement) => {
    if (el) {
      const nextBBox = el.getBoundingClientRect()
      if (
        nextBBox.x !== bbox.x ||
        nextBBox.y !== bbox.y ||
        nextBBox.width !== bbox.width ||
        nextBBox.height !== bbox.height
      ) setBoundingBox(nextBBox)
    }
  }

  // when the canvas is ready and placed within the DOM, save its bounding box to be provided down
  // to children component as a context value for future calculations.
  useEffect(() => calculateBBox(canvasRef.current), [canvasRef.current])
  // same on window scroll and resize
  useWindowScroll(() => calculateBBox(canvasRef.current))
  useWindowResize(() => calculateBBox(canvasRef.current))

  return (
    <div className={classList} ref={canvasRef} {...rest}>
      <div className="bi-diagram-canvas">
        <DiagramContext.Provider value={{ canvas: bbox, ports: portRefs, nodes: nodeRefs }}>
          {children}
        </DiagramContext.Provider>
      </div>
    </div>
  )
}

DiagramCanvas.defaultProps = {
  portRefs: {},
  nodeRefs: {},
  className: '',
}

export default React.memo(DiagramCanvas)
