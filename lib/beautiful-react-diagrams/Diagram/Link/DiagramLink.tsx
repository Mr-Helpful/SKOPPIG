import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import usePortRefs from '../../shared/internal_hooks/usePortRefs'
import useCanvas from '../../shared/internal_hooks/useCanvas'
import getCoords from './getEntityCoordinates'
import makeSvgPath from '../../shared/functions/makeSvgPath'
import getPathMidpoint from '../../shared/functions/getPathMidpoint'
import useNodeRefs from '../../shared/internal_hooks/useNodeRefs'
import LinkLabel from './LinkLabel'
import { DiagramEntity } from '../LinksCanvas/findInvolvedEntity'
import { Link, ClickEvent } from '../../shared/Types'

interface LinkProps {
  input: DiagramEntity
  output: DiagramEntity
  link: Link
  onDelete: (link: Link) => void
  onLinkClick: (ev: ClickEvent, link: Link) => void
}

/**
 * A Diagram link component displays the link between two diagram nodes or two node ports.
 */
const DiagramLink = ({
  input,
  output,
  link,
  onDelete,
  onLinkClick
}: LinkProps) => {
  const pathRef = useRef<SVGPathElement>(null)
  const canvas = useCanvas()
  const nodeRefs = useNodeRefs()
  const portRefs = usePortRefs()
  const [labelPosition, setLabelPosition] = useState<[number, number]>()

  const inputPoint = useMemo(
    () => getCoords(input, portRefs, nodeRefs, canvas),
    [input, portRefs, nodeRefs, canvas]
  )
  /* eslint-disable max-len */
  const classList = useMemo(
    () =>
      classNames(
        'bi-diagram-link',
        { 'readonly-link': link.readonly },
        link.className
      ),
    [link.readonly, link.className]
  )
  const outputPoint = useMemo(
    () => getCoords(output, portRefs, nodeRefs, canvas),
    [output, portRefs, nodeRefs, canvas]
  )
  /* eslint-enable max-len */
  const path = useMemo(() => {
    const pathOptions = {
      type:
        input.type === 'port' || output.type === 'port' ? 'bezier' : 'curve',
      inputAlignment: { alignment: undefined, ...input.entity }.alignment,
      outputAlignment: { alignment: undefined, ...output.entity }.alignment
    }
    return makeSvgPath(inputPoint, outputPoint, pathOptions)
  }, [
    inputPoint,
    outputPoint,
    input.type,
    input.entity,
    output.type,
    output.entity
  ])

  // calculates label position
  useEffect(() => {
    if (link.label && inputPoint && outputPoint && pathRef.current) {
      const pos = getPathMidpoint(pathRef.current)
      setLabelPosition(pos)
    }
  }, [pathRef, link.label, inputPoint, outputPoint])

  // on link delete
  const onDoubleClick = useCallback(() => {
    if (onDelete && !link.readonly) onDelete(link)
  }, [link, onDelete])

  return (
    <g className={classList}>
      {!link.readonly && (
        <path
          d={path}
          className="bi-link-ghost"
          onClick={ev => onLinkClick(ev, link)}
          onDoubleClick={onDoubleClick}
        />
      )}
      <path
        d={path}
        ref={pathRef}
        className="bi-link-path"
        onClick={ev => onLinkClick(ev, link)}
        onDoubleClick={onDoubleClick}
      />
      {link.label && labelPosition && (
        <LinkLabel position={labelPosition} label={link.label} />
      )}
    </g>
  )
}

export default React.memo(DiagramLink)