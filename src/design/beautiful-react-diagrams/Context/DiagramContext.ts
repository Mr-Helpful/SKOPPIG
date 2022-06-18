import { createContext } from 'react'

export type ElementObject = {
  [key: string]: HTMLElement
}

type ContextValue = {
  canvas: DOMRect
  ports: ElementObject
  nodes: ElementObject
}

export default createContext<ContextValue>({
  canvas: null, ports: null, nodes: null
})
