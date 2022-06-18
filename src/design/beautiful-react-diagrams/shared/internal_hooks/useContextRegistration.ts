import { MutableRefObject } from 'react'
import { useCallback, useEffect, useContext } from 'react'
import DiagramContext from '../../Context/DiagramContext'
import { Port } from '../Types-ts'

/**
 * Returns a callback that will perform the onPortRegister function when the context is ready (canvas exists)
 * and there's at least one input or one output
 */
export const usePortRegistration = (inputs: Port[], outputs: Port[], onPortRegister: (portId: string, portElement: HTMLDivElement) => void) => {
  const { canvas, ports } = useContext(DiagramContext)

  return useCallback((portId: string, portElement: HTMLDivElement) => {
    if (canvas && (inputs || outputs)) {
      if (ports && !ports[portId]) {
        onPortRegister(portId, portElement)
      }
    }
  }, [!!canvas, !!ports, inputs, outputs])
}

/**
 * Takes a dom reference and an onNodeRegister callback and perform the callback when the node is mounted
 * and the canvas is ready
 */
export const useNodeRegistration = (ref: MutableRefObject<HTMLDivElement>, onNodeRegister: (id: string, el: HTMLElement) => void, id: string) => {
  const { canvas, nodes } = useContext(DiagramContext)

  useEffect(() => {
    if (onNodeRegister && ref.current && canvas && nodes && !nodes[id]) {
      onNodeRegister(id, ref.current)
    }
  }, [ref.current, onNodeRegister, !!canvas, !!nodes, id])
}
