import React, { useCallback } from 'react'
import DiagramLink from '../Link/DiagramLink'
import DiagramSegment from '../Segment/DiagramSegment'
import findInvolvedEntity from './findInvolvedEntity'
import removeLink from './removeLinkFromArray'
import { Node, Link, ClickEvent, Segment } from '../../shared/Types'

interface LinksCanvasProps {
  nodes: Node[]
  segment: Segment
  links: Link[]
  onDelete: (link: Link) => void
  onLinkClick: (ev: ClickEvent, link: Link) => void
  onCanvasClick: (ev: ClickEvent) => void
}

/**
 * Handles the links' events and business logic, wraps the links within a svg
 */
const LinksCanvas = ({
  nodes,
  segment,
  links,
  onDelete,
  onLinkClick,
  onCanvasClick
}: LinksCanvasProps) => {
  return (
    <div onClick={onCanvasClick} className="bi bi-link-canvas-layer">
      <svg>
        {links &&
          links.length > 0 &&
          links.map(link => {
            const entityIn = findInvolvedEntity(nodes, link.input)
            const entityOut = findInvolvedEntity(nodes, link.output)
            return (
              <DiagramLink
                link={link}
                input={entityIn}
                output={entityOut}
                onDelete={onDelete}
                onLinkClick={onLinkClick}
                key={`${entityIn.entity.id}-${entityOut.entity.id}`}
              />
            )
          })}
        {segment && <DiagramSegment {...segment} />}
      </svg>
    </div>
  )
}

export default React.memo(LinksCanvas)
