import React from 'react'
import DiagramNode from '../DiagramNode/DiagramNode'

import { Node } from '../../shared/Types'

interface NodesCanvasProps {
  nodes: Node[]
}

/**
 * Handles the nodes' events and business logic
 */
const NodesCanvas = ({ nodes }: NodesCanvasProps) => {
  // we need to wrap this in a div as React.memo complains about
  // the function having a signature of (props: ...) => Element[]
  // rather than a signature of (props: ...) => Element
  return (
    <>
      {nodes.map(({ id, ...node }) => (
        <DiagramNode {...node} id={id} key={id} />
      ))}
    </>
  )
}

export default React.memo(NodesCanvas)
