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
import { Link } from '../../shared/Types'

// local hook, returns portRefs & nodeRefs
const useContextRefs = () => {
  const canvas = useCanvas()
  const portRefs = usePortRefs()
  const nodeRefs = useNodeRefs()

  return { canvas, nodeRefs, portRefs }
}

interface LinkProps {
  input: DiagramEntity
  output: DiagramEntity
  link: Link
  onDelete: (link: Link) => void
}

/**
 * A Diagram link component displays the link between two diagram nodes or two node ports.
 */
const DiagramLink = ({ input, output, link, onDelete }: LinkProps) => {
  const pathRef = useRef()
  const [labelPosition, setLabelPosition] = useState<[number, number]>()
  const { canvas, portRefs, nodeRefs } = useContextRefs()
  const inputPoint = useMemo(() => getCoords(input, portRefs, nodeRefs, canvas), [input, portRefs, nodeRefs, canvas])
  /* eslint-disable max-len */
  const classList = useMemo(() => classNames('bi-diagram-link', { 'readonly-link': link.readonly }, link.className), [link.readonly, link.className])
  const outputPoint = useMemo(() => getCoords(output, portRefs, nodeRefs, canvas), [output, portRefs, nodeRefs, canvas])
  /* eslint-enable max-len */
  const path = useMemo(() => {
    const pathOptions = {
      type: (input.type === 'port' || output.type === 'port') ? 'bezier' : 'curve',
      inputAlignment: ({ alignment: null, ...input.entity }).alignment,
      outputAlignment: ({ alignment: null, ...output.entity }).alignment,
    }
    return makeSvgPath(inputPoint, outputPoint, pathOptions)
  }, [
    inputPoint, outputPoint,
    input.type, input.entity,
    output.type, output.entity
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
      {!link.readonly && (<path d={path} className="bi-link-ghost" onDoubleClick={onDoubleClick} />)}
      <path d={path} ref={pathRef} className="bi-link-path" onDoubleClick={onDoubleClick} />
      {link.label && labelPosition && (<LinkLabel position={labelPosition} label={link.label} />)}
    </g>
  )
}

DiagramLink.defaultProps = {
  onDelete: undefined,
}

export default React.memo(DiagramLink)
