import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { usePortRefs } from '../../Context/DiagramContext'
import { useCanvas } from '../../Context/DiagramContext'
import getCoords from './getEntityCoordinates'
import makeSvgPath from '../../shared/functions/makeSvgPath'
import getPathMidpoint from '../../shared/functions/getPathMidpoint'
import { useNodeRefs } from '../../Context/DiagramContext'
import LinkLabel from './LinkLabel'
import { DiagramEntity, isNode } from '../LinksCanvas/findInvolvedEntity'
import { useDiagramMethods } from '../MethodContext/MethodContext'

import { Link, ClickEvent } from '../../shared/Types'

interface LinkProps {
  input: DiagramEntity
  output: DiagramEntity
  link: Link
}

/**
 * A Diagram link component displays the link between two diagram nodes or two node ports.
 */
const DiagramLink = ({ input, output, link }: LinkProps) => {
  const methods = useDiagramMethods()
  const pathRef = useRef<SVGPathElement>(null)
  const canvas = useCanvas()
  const nodeRefs = useNodeRefs()
  const portRefs = usePortRefs()
  const [labelPosition, setLabelPosition] = useState<[number, number]>()

  const inputPoint = useMemo(
    () => getCoords(input, portRefs, nodeRefs, canvas),
    [input, portRefs, nodeRefs, canvas]
  )
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
  const path = useMemo(() => {
    const pathOptions = {
      type: isNode(input) && isNode(output) ? 'curve' : 'bezier',
      inputAlignment: { alignment: undefined, ...input }.alignment,
      outputAlignment: { alignment: undefined, ...output }.alignment
    }
    return makeSvgPath(inputPoint, outputPoint, pathOptions)
  }, [inputPoint, outputPoint, input, output])

  // calculates label position
  useEffect(() => {
    if (link.label && inputPoint && outputPoint && pathRef.current) {
      const pos = getPathMidpoint(pathRef.current)
      setLabelPosition(pos)
    }
  }, [pathRef, link.label, inputPoint, outputPoint])

  // on link create
  useEffect(() => {
    return methods.config?.onLinkMount(link)
  }, [link, methods])

  // on link delete
  const onDoubleClick = useCallback(
    () => methods.onLinkDelete(link),
    [link, methods]
  )

  // on link click
  const onClick = useCallback(
    (ev: unknown) => methods.config?.onLinkClick(ev as ClickEvent, link),
    [link, methods]
  )

  return (
    <g className={classList}>
      {!link.readonly && (
        <path
          d={path}
          className="bi-link-ghost"
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
      )}
      <path
        d={path}
        ref={pathRef}
        className="bi-link-path"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />
      {link.label && labelPosition && (
        <LinkLabel position={labelPosition} label={link.label} />
      )}
    </g>
  )
}

export default React.memo(DiagramLink)
