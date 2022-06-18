import throttle from 'lodash.throttle'
import { useRef, useCallback, useEffect, MutableRefObject } from 'react'

type Options = {
  throttleBy: number
}

const defaultOptions = {
  /**
   * Throttle the onDrag handler by the given ms
   * @default 0ms
   */
  throttleBy: 0,
}

/**
 * Returns the click coordinates of a MouseEvent
 * @param event
 * @returns {*[]}
 */
const getEventCoordinates = (event: MouseEvent): [number, number] =>
  [event.clientX, event.clientY]

/**
 * Create a persistent callback reference that will live trough a component lifecycle
 * @param ref
 * @returns {Function}
 */
const useCallbackRef = <P>(ref: MutableRefObject<P>) =>
  useCallback((callback: P) => {
    if (!ref.current || callback !== ref.current) {
      // eslint-disable-next-line no-param-reassign
      ref.current = callback
    }
  }, [ref])

type DragInfo = {
  isDragging: boolean
  start: [number, number]
  end: [number, number]
  offset: [number, number]
}

type Handler = (
  event: MouseEvent,
  info: DragInfo
) => void

/**
 * A custom hook exposing handlers and ref for developing draggable React elements.
 *
 * ## Basic Usage:
 *
 * ```
 * const DraggableItem = () => {
 *    const { ref, isDragging, onDragStart, onDrag, onDragEnd } = useDrag()
 *
 *    onDragStart(dragStartHandler)
 *
 *    onDrag(dragHandler)
 *
 *    onDragEnd(dragEndHandler)
 *
 *    return (
 *      <div ref={ref}>
 *        Drag me!
 *      </div>
 *    )
 * }
 * ```
 *
 * ## Options:
 *
 * ```
 * const DraggingItem = () => {
 *    const ref = useRef()
 *    const options = { ref, throttleBy: 60 }
 *    const { isDragging, onDragStart, onDrag, onDragEnd } = useDrag(options)
 *
 *    onDragStart(dragStartHandler)
 *
 *    onDrag(dragHandler)
 *
 *    onDragEnd(dragEndHandler)
 *
 *    return (
 *      <div ref={ref}>
 *        Drag me!
 *      </div>
 *    )
 * }
 * ```
 */
const useDrag = <P extends HTMLElement>(options: Options = defaultOptions) => {
  const targetRef = useRef<P>(undefined); // the target draggable element
  const dragStartHandlerRef = useRef<Handler>(); // a ref to user's onDragStart handler
  const dragHandlerRef = useRef<Handler>(); // a ref to user's onDrag handler
  const dragEndHandlerRef = useRef<Handler>(); // a ref to user's onDragEnd handler
  // the dragging state is created from a useRef rather than a useState to avoid rendering during the dragging process
  const { current: info } = useRef<DragInfo>(
    { isDragging: false, start: null, end: null, offset: null }
  )

  /**
   * When the dragging starts, updates the state then perform the user's onDragStart handler if exists
   */
  const onDragStart = useCallback((event) => {
    if (!info.isDragging && targetRef.current.contains(event.target)) {
      info.isDragging = true
      info.end = null
      info.offset = null
      info.start = getEventCoordinates(event)

      if (dragStartHandlerRef.current) {
        dragStartHandlerRef.current(event, { ...info })
      }
    }
  }, [targetRef, info, dragStartHandlerRef])

  /**
   * Whilst dragging the element, updates the state then perform the user's onDrag handler if exists
   */
  const onDrag = useCallback(throttle((event) => {
    if (info.isDragging) {
      info.offset = [info.start[0] - event.clientX, info.start[1] - event.clientY]

      if (dragHandlerRef.current) {
        dragHandlerRef.current(event, { ...info })
      }
    }
  }, options.throttleBy), [targetRef, info, dragHandlerRef])

  /**
   * When the dragging ends, updates the state then perform the user's onDragEnd handler if exists
   */
  const onDragEnd = useCallback((event) => {
    if (info.isDragging) {
      info.isDragging = false
      info.end = getEventCoordinates(event)

      if (dragEndHandlerRef.current) {
        dragEndHandlerRef.current(event, { ...info })
      }
    }
  }, [info, dragEndHandlerRef])

  /**
   * When the layout renders the target item, assign the dragging events
   */
  useEffect(() => {
    /* eslint-disable no-underscore-dangle */
    const _onDragStart = (e) => onDragStart(e)
    const _onDrag = (e) => onDrag(e)
    const _onDragEnd = (e) => onDragEnd(e)
    /* eslint-enable no-underscore-dangle */

    const currentTarget = targetRef.current
    if (currentTarget) {
      currentTarget.addEventListener('mousedown', _onDragStart)
      document.addEventListener('mousemove', _onDrag)
      document.addEventListener('mouseup', _onDragEnd)
    }

    return () => {
      if (currentTarget) {
        currentTarget.removeEventListener('mousedown', _onDragStart)
        document.removeEventListener('mousemove', _onDrag)
        document.removeEventListener('mouseup', _onDragEnd)
      }
    }
  }, [targetRef, onDragStart, onDrag, onDragEnd])

  return {
    ref: targetRef,
    onDragStart: useCallbackRef(dragStartHandlerRef),
    onDrag: useCallbackRef(dragHandlerRef),
    onDragEnd: useCallbackRef(dragEndHandlerRef),
  }
}

export default useDrag
