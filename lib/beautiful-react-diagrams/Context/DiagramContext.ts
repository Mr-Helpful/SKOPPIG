import { createContext } from 'react'
import { ElementObject } from '../shared/Types'

type ContextValue = {
  canvas: DOMRect | null
  ports: ElementObject
  nodes: ElementObject
}

export default createContext<ContextValue>({
  canvas: null,
  ports: {},
  nodes: {}
})
