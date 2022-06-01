import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { NodeType } from '../../shared/Types'
import DiagramNode from '../DiagramNode/DiagramNode'
import updateNodeCoordinates from './updateNodeCoordinates'
import { SchemaContext } from '../../Context/SchemaContext'

/**
 * Handles the nodes' events and business logic
 */
const NodesCanvas = (props) => {
  const {
    nodes,
    onPortRegister, onNodeRegister, onNodeRemove, onNodeClick,
    onDragNewSegment, onSegmentFail, onSegmentConnect, onChange,
  } = props

  // const { nodes } = useContext(SchemaContext)

  // when a node item update its position updates it within the nodes array
  const onNodePositionChange = (nodeId, newCoordinates) => {
    if (onChange) {
      const nextNodes = updateNodeCoordinates(nodeId, newCoordinates, nodes)
      onChange(nextNodes)
    }
  }

  return nodes && nodes.length > 0 &&
    nodes.map(({ data, ...node }) => (
      <DiagramNode
        {...node}
        data={data}
        onPositionChange={onNodePositionChange}
        onPortRegister={onPortRegister}
        onNodeRemove={onNodeRemove}
        onNodeClick={onNodeClick}
        onDragNewSegment={onDragNewSegment}
        onSegmentFail={onSegmentFail}
        onSegmentConnect={onSegmentConnect}
        onMount={onNodeRegister}
        key={node.id}
      />
    ))
}

NodesCanvas.propTypes = {
  nodes: PropTypes.arrayOf(NodeType),
  onChange: PropTypes.func,
  onNodeRegister: PropTypes.func,
  onPortRegister: PropTypes.func,
  onNodeRemove: PropTypes.func,
  onNodeClick: PropTypes.func,
  onDragNewSegment: PropTypes.func,
  onSegmentFail: PropTypes.func,
  onSegmentConnect: PropTypes.func,
}

NodesCanvas.defaultProps = {
  nodes: [],
  onChange: undefined,
  onNodeRegister: undefined,
  onPortRegister: undefined,
  onNodeRemove: undefined,
  onNodeClick: undefined,
  onDragNewSegment: undefined,
  onSegmentFail: undefined,
  onSegmentConnect: undefined,
}

export default React.memo(NodesCanvas)
