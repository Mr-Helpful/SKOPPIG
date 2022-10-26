import React from 'react'
import DiagramLink from '../Link/DiagramLink'
import DiagramSegment from '../Segment/DiagramSegment'
import findInvolvedEntity from './findInvolvedEntity'
import { useDiagramMethods } from '../MethodContext/MethodContext'

import { Node, Link, Segment } from '../../shared/Types'

interface LinksCanvasProps {
  nodes: Node[]
  segment: Segment
  links: Link[]
}

/**
 * Handles the links' events and business logic, wraps the links within a svg
 */
const LinksCanvas = ({ nodes, segment, links }: LinksCanvasProps) => {
  const methods = useDiagramMethods()
  return (
    <div
      onClick={ev => methods.config?.onCanvasClick(ev)}
      className="bi bi-link-canvas-layer"
    >
      <svg>
        {links.map(link => {
          const input = findInvolvedEntity(nodes, link.input)
          const output = findInvolvedEntity(nodes, link.output)
          return (
            <DiagramLink
              link={link}
              input={input}
              output={output}
              key={`${input.id}-${output.id}`}
            />
          )
        })}
        {segment && <DiagramSegment {...segment} />}
      </svg>
    </div>
  )
}

export default React.memo(LinksCanvas)
