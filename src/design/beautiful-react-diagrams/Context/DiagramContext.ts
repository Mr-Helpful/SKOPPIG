import React, { MutableRefObject } from 'react'

type RefObject = {
  [key: string]: HTMLElement
}

type DiagramRefs = {
  // canvas: MutableRefObject
  ports: MutableRefObject<HTMLElement>
}

export default React.createContext({
  canvas: null, ports: null, nodes: null, _nodes: null
})
