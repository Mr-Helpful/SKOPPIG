import React from 'react'
import { Port, PortAlignment } from '../../shared/Types'
import DiagramPort from '../Port/DiagramPort'

interface GeneratorProps {
  registerPort: (id: string, el: HTMLElement) => void
  onDragNewSegment: (
    id: string,
    from: [number, number],
    to: [number, number],
    alignment?: PortAlignment
  ) => void
  onSegmentFail: (id: string, type: 'input' | 'output') => void
  onSegmentConnect: (
    input: string,
    output: string,
    type: 'input' | 'output'
  ) => void
}

const portGenerator = (
  {
    registerPort,
    onDragNewSegment,
    onSegmentFail,
    onSegmentConnect
  }: GeneratorProps,
  type: 'input' | 'output'
) =>
  function PortGen(port: Port) {
    return (
      <DiagramPort
        {...port}
        onMount={registerPort}
        onDragNewSegment={onDragNewSegment}
        onSegmentFail={onSegmentFail}
        onSegmentConnect={onSegmentConnect}
        type={type}
        key={port.id}
      />
    )
  }

export default portGenerator
