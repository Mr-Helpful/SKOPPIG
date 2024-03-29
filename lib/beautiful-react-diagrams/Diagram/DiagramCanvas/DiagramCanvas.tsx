import React, {
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import useWindowScroll from 'beautiful-react-hooks/useWindowScroll'
import useWindowResize from 'beautiful-react-hooks/useWindowResize'
import classNames from 'classnames'
import DiagramProvider from '../../Context/DiagramContext'

import { ElementObject } from '../../shared/Types'

interface DiagramCanvasProps extends HTMLAttributes<HTMLDivElement> {
  portRefs: ElementObject
  nodeRefs: ElementObject
}

/**
 * The DiagramCanvas component provides a context to the Diagram children.
 * The context contains the canvas bounding box (for future calculations) and the port references in order to
 * allow links to easily access to a the ports coordinates
 */
const DiagramCanvas = ({
  portRefs,
  nodeRefs,
  children,
  className = '',
  ...rest
}: DiagramCanvasProps) => {
  const [bbox, setBoundingBox] = useState<DOMRect | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const classList = classNames('bi bi-diagram ', className)

  // calculate the given element bounding box and save it into the bbox state
  const calculateBBox = useCallback(
    (el: HTMLElement | null) => {
      if (el !== null) {
        const nextBBox = el.getBoundingClientRect()
        if (
          bbox === null ||
          nextBBox.x !== bbox.x ||
          nextBBox.y !== bbox.y ||
          nextBBox.width !== bbox.width ||
          nextBBox.height !== bbox.height
        )
          setBoundingBox(nextBBox)
      }
    },
    [bbox]
  )

  // when the canvas is ready and placed within the DOM, save its bounding box to be provided down
  // to children component as a context value for future calculations.
  useEffect(() => calculateBBox(canvasRef.current), [calculateBBox, canvasRef])
  // same on window scroll and resize
  useWindowScroll()(() => calculateBBox(canvasRef.current))
  useWindowResize()(() => calculateBBox(canvasRef.current))

  return (
    <div className={classList} ref={canvasRef} {...rest}>
      <div className="bi-diagram-canvas">
        <DiagramProvider
          value={{ canvas: bbox, ports: portRefs, nodes: nodeRefs }}
        >
          {children}
        </DiagramProvider>
      </div>
    </div>
  )
}

export default React.memo(DiagramCanvas)
