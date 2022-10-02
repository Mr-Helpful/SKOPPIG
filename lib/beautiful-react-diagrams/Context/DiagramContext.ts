import { createContext, useContext } from 'react'

import { ElementObject } from '../shared/Types'

type ContextValue = {
  canvas: DOMRect
  ports: ElementObject
  nodes: ElementObject
}

export const DiagramContext = createContext<ContextValue | undefined>(undefined)

const useDiagramContext = () => {
  const contextValue = useContext(DiagramContext)
  if (contextValue === undefined) {
    throw new Error('useDiagramContext must be used within a DiagramProvider')
  }
  return contextValue
}

/**
 * Returns the node references from the DiagramContext
 */
export const useNodeRefs = () => useDiagramContext().nodes

/**
 * Returns the port references from the DiagramContext
 */
export const usePortRefs = () => useDiagramContext().ports

/**
 * Returns the canvas bounding box from the DiagramContext
 */
export const useCanvas = () => useDiagramContext().canvas

export default DiagramContext.Provider
