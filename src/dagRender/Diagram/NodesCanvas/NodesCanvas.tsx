import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { NodeType } from '../../shared/Types'
import DiagramNode from '../DiagramNode/DiagramNode'
import updateNodeCoordinates from './updateNodeCoordinates'

/**
 * Handles the nodes' events and business logic
 */
const NodesCanvas = (props) => {
  const {
    nodes,
    onPortRegister, onNodeRegister, onNodeRemove, onNodeClick,
    onDragNewSegment, onSegmentFail, onSegmentConnect, onChange,
  } = props

  // when a node item update its position updates it within the nodes array
  const onNodePositionChange = (nodeId, newCoordinates) => {
    if (onChange) {
      const nextNodes = updateNodeCoordinates(nodeId, newCoordinates, nodes)
      onChange(nextNodes)
    }
  }

  return nodes && nodes.length > 0 &&
    nodes.map(({ data, id, ...node }) => (
      <DiagramNode
        {...node}
        id={id}
        data={data}
        onPositionChange={onNodePositionChange}
        onPortRegister={onPortRegister}
        onNodeRemove={onNodeRemove}
        onNodeClick={onNodeClick}
        onDragNewSegment={onDragNewSegment}
        onSegmentFail={onSegmentFail}
        onSegmentConnect={onSegmentConnect}
        onMount={onNodeRegister}
        key={id}
      />
    ))
}

NodesCanvas.propTypes = {
  nodes: PropTypes.arrayOf(NodeType),
  callRefs: PropTypes.shape({}),
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
  callRefs: {},
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
