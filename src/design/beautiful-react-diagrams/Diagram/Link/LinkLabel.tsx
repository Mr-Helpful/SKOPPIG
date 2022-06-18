import React, { ReactNode } from 'react'

interface LinkLabelProps {
  label?: ReactNode
  position: [number, number]
}

/**
 * Diagram link label
 */
const LinkLabel = ({ label, position }: LinkLabelProps) => (
  <foreignObject x={position[0]} y={position[1]}>
    <div className="bi-diagram-link-label">
      {label}
    </div>
  </foreignObject>
)

export default React.memo(LinkLabel)
