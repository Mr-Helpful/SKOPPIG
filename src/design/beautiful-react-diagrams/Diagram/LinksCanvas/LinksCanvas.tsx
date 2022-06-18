import React, { useCallback } from 'react'
import DiagramLink from '../Link/DiagramLink'
import DiagramSegment from '../Segment/DiagramSegment'
import findInvolvedEntity from './findInvolvedEntity'
import removeLinkFromArray from './removeLinkFromArray'
import { Segment } from '../Segment/DiagramSegment'
import { Node, Link } from '../../shared/Types-ts'

interface LinksCanvasProps {
  nodes: Node[]
  segment: Segment
  onChange: (links: Link[]) => void
  links: Link[]
}

/**
 * Handles the links' events and business logic, wraps the links within a svg
 */
const LinksCanvas = (props: LinksCanvasProps) => {
  const { nodes, segment, onChange, links } = props

  const removeFromLinksArray = useCallback((link) => {
    if (links.length > 0 && onChange) {
      const nextLinks = removeLinkFromArray(link, links)
      onChange(nextLinks)
    }
  }, [links, onChange])

  return (
    <svg className="bi bi-link-canvas-layer">
      {links && links.length > 0 && links.map((link) => {
        return (
          <DiagramLink
            link={link}
            input={findInvolvedEntity(nodes, link.input)}
            output={findInvolvedEntity(nodes, link.output)}
            onDelete={removeFromLinksArray}
            key={`${link.input}-${link.output}`}
          />
        )
      })}
      {segment && (
        <DiagramSegment {...segment} />
      )}
    </svg>
  )
}

LinksCanvas.defaultProps = {
  nodes: [],
  links: [],
  segment: undefined,
  onChange: undefined,
}

export default React.memo(LinksCanvas)
