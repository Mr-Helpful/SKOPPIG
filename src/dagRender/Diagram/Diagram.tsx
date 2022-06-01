import React, { useCallback, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import DiagramCanvas from './DiagramCanvas/DiagramCanvas'
import NodesCanvas from './NodesCanvas/NodesCanvas'
import LinksCanvas from './LinksCanvas/LinksCanvas'
import { ConfigType, SchemaType } from '../shared/Types'
import { SchemaContext } from '../Context/SchemaContext'

import { Alignment } from '../shared/functions/makeSvgPath'
import { Link, Schema } from '../shared/Types-ts'

type Segment = {
  id: string
  from: [number, number]
  to: [number, number]
  alignment: Alignment
}

type Config = {
  shouldLink?: (link: Link, schema: Schema) => boolean
  onNodeClick?: (id: string, schema: Schema) => void
  onCanvasClick?: (schema: Schema) => void
}

const defaultConfig: Config = {
  shouldLink: (link: Link, schema: Schema): boolean => !schema.links.some(l =>
    l.input === link.input && l.output === link.output
  ),
  onNodeClick: () => { },
  onCanvasClick: () => { }
}

/**
 * The Diagram component is the root-node of any diagram.<br />
 * It accepts a `schema` prop defining the current state of the diagram and emits its possible changes through the
 * `onChange` prop, allowing the developer to have the best possible control over the diagram and its interactions
 * with the user.
 * `config` prop for additional control over the logic of the diagram.
 */
const Diagram = (props) => {
  const { schema, onChange, ...rest } = props
  const config = { ...defaultConfig, ...props.config }
  const [segment, setSegment] = useState<Segment>()
  const { current: portRefs } = useRef({}); // keeps the port elements references
  const { current: nodeRefs } = useRef({}); // keeps the node elements references

  // when nodes change, performs the onChange callback with the new incoming data
  const onNodesChange = (nextNodes) => {
    if (onChange) {
      onChange({ nodes: nextNodes })
    }
  }

  // when a port is registered, save it to the local reference
  const onPortRegister = (portId, portEl) => {
    portRefs[portId] = portEl
  }

  // when a node is registered, save it to the local reference
  const onNodeRegister = (nodeId, nodeEl) => {
    nodeRefs[nodeId] = nodeEl
  }

  // when a node is deleted, remove its references
  const onNodeRemove = useCallback((nodeId, inputsPorts, outputsPorts) => {
    delete nodeRefs[nodeId]
    inputsPorts.forEach((input) => delete portRefs[input])
    outputsPorts.forEach((output) => delete portRefs[output])
  }, [])

  const onNodeClick = id => {
    config.onNodeClick(id, schema)
  }

  // when a new segment is dragged, save it to the local state
  const onDragNewSegment = useCallback((portId, from, to, alignment) => {
    setSegment({ id: `segment-${portId}`, from, to, alignment })
  }, [])

  // when a segment fails to connect, reset the segment state
  const onSegmentFail = useCallback(() => {
    setSegment(undefined)
  }, [])

  // when a segment connects, update the links schema, perform the onChange callback
  // with the new data, then reset the segment state
  const onSegmentConnect = (input, output) => {
    if (config.shouldLink({ input, output }, schema)) {
      const nextLinks = [...(schema.links || []), { input, output }]
      if (onChange) {
        onChange({ links: nextLinks })
      }
    }
    setSegment(undefined)
  }

  // when links change, performs the onChange callback with the new incoming data
  const onLinkDelete = (nextLinks) => {
    if (onChange) {
      onChange({ links: nextLinks })
    }
  }

  const onCanvasClick = () => {
    config.onCanvasClick(schema)
  }

  return (
    <DiagramCanvas portRefs={portRefs} nodeRefs={nodeRefs} {...rest}>
      <SchemaContext.Provider value={schema}>
        <NodesCanvas
          nodes={schema.nodes}
          onChange={onNodesChange}
          onNodeRegister={onNodeRegister}
          onPortRegister={onPortRegister}
          onNodeRemove={onNodeRemove}
          onNodeClick={onNodeClick}
          onDragNewSegment={onDragNewSegment}
          onSegmentFail={onSegmentFail}
          onSegmentConnect={onSegmentConnect}
        />
        <LinksCanvas nodes={schema.nodes} links={schema.links} segment={segment} onChange={onLinkDelete} onClick={config.onClick} />
      </SchemaContext.Provider>
    </DiagramCanvas>
  )
}

Diagram.propTypes = {
  /**
   * The diagram current schema
   */
  schema: SchemaType,
  /**
   * The callback to be performed every time the model changes
   */
  onChange: PropTypes.func,
  /**
   * Additional diagram config
   */
  config: ConfigType
}

Diagram.defaultProps = {
  schema: { nodes: [], links: [] },
  onChange: undefined,
}

export default React.memo(Diagram)
