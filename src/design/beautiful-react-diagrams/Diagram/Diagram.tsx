import React, { useCallback, useState, useRef, useEffect, HTMLAttributes } from 'react'
import DiagramCanvas from './DiagramCanvas/DiagramCanvas'
import NodesCanvas from './NodesCanvas/NodesCanvas'
import LinksCanvas from './LinksCanvas/LinksCanvas'

import { Link, Node, PortAlignment, Schema } from '../shared/Types-ts'
import { ElementObject } from '../Context/DiagramContext'

type Segment = {
  id: string
  from: [number, number]
  to: [number, number]
  alignment: PortAlignment
}

type Config = {
  shouldLink: (link: Link, schema: Schema) => boolean
  onCanvasClick: (schema: Schema) => void
}

const defaultConfig: Config = {
  shouldLink: (link, schema) => !schema.links.some(l =>
    l.input === link.input && l.output === link.output
  ),
  onCanvasClick: () => { }
}

interface DiagramProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * The diagram current schema
   */
  schema: Schema
  /**
   * The callback to be performed every time the model changes
   */
  onChange: (schema: Partial<Schema>) => void
  display?: { show: () => void }
  /**
   * Additional diagram config
   */
  config?: Config
}

/**
 * The Diagram component is the root-node of any diagram.<br />
 * It accepts a `schema` prop defining the current state of the diagram and emits its possible changes through the
 * `onChange` prop, allowing the developer to have the best possible control over the diagram and its interactions
 * with the user.
 * `config` prop for additional control over the logic of the diagram.
 */
const Diagram = (props: DiagramProps) => {
  const { schema, onChange, display, config: userConfig, ...rest } = props
  const config = { ...defaultConfig, ...userConfig }
  const [segment, setSegment] = useState<Segment>()
  const { current: portElems } = useRef<ElementObject>({}) // keeps the port elements references
  const { current: nodeElems } = useRef<ElementObject>({}) // keeps the node elements references

  useEffect(() => {
    display.show = () => {
      console.log("%cNew references", "color: green")
      for (let id in portElems) {
        console.log(id)
        console.log(portElems[id])
      }
      for (let id in nodeElems) {
        console.log(id)
        console.log(nodeElems[id])
      }
    }
  })

  // when nodes change, performs the onChange callback with the new incoming data
  const onNodesChange = (nextNodes: Node[]) => {
    if (onChange) onChange({ nodes: nextNodes })
  }

  // when a port is registered, save it to the local reference
  const onPortRegister = (portId: string, portEl: HTMLElement) => {
    portElems[portId] = portEl
  }

  // when a node is registered, save it to the local reference
  const onNodeRegister = (nodeId: string, nodeEl: HTMLElement) => {
    nodeElems[nodeId] = nodeEl
  }

  // when a node is deleted, remove its references
  const onNodeRemove = useCallback((nodeId: string, inputsPorts: string[], outputsPorts: string[]) => {
    delete nodeElems[nodeId]
    inputsPorts.forEach(input => delete portElems[input])
    outputsPorts.forEach(output => delete portElems[output])
  }, [])

  const onNodeDelete = (nodeId: string) => {
    let { nodes, links } = schema

    const node = nodes.find(({ id }) => id === nodeId)
    if (node !== undefined) {
      const inputs = node.inputs && node.inputs.map(p => p.id)
      const outputs = node.outputs && node.outputs.map(p => p.id)

      // remove references to the deleted node and its links
      delete nodeElems[nodeId]
      for (let id of inputs) delete portElems[id]
      for (let id of outputs) delete portElems[id]

      // remove the deleted node and links from the schema
      links = links.filter(
        link => !inputs.includes(link.input) && !outputs.includes(link.output)
      )
      nodes = nodes.filter(({ id }) => id !== nodeId)
    }

    onChange({ nodes, links })
  }

  // when a new segment is dragged, save it to the local state
  const onDragNewSegment = useCallback((portId: string, from: [number, number], to: [number, number], alignment: PortAlignment) => {
    setSegment({ id: `segment-${portId}`, from, to, alignment })
  }, [])

  // when a segment fails to connect, reset the segment state
  const onSegmentFail = useCallback(() => {
    setSegment(undefined)
  }, [])

  // when a segment connects, update the links schema, perform the onChange callback
  // with the new data, then reset the segment state
  const onSegmentConnect = (input: string, output: string) => {
    if (config.shouldLink({ input, output }, schema)) {
      const nextLinks: Link[] = [...(schema.links || []), { input, output }]
      if (onChange) onChange({ links: nextLinks })
    }
    setSegment(undefined)
  }

  // when links change, performs the onChange callback with the new incoming data
  const onLinkDelete = (nextLinks: Link[]) => {
    if (onChange) onChange({ links: nextLinks })
  }

  return (
    <DiagramCanvas portRefs={portElems} nodeRefs={nodeElems} {...rest}>
      <NodesCanvas
        nodes={schema.nodes}
        onChange={onNodesChange}
        onNodeRegister={onNodeRegister}
        onPortRegister={onPortRegister}
        onNodeRemove={onNodeRemove}
        onDragNewSegment={onDragNewSegment}
        onSegmentFail={onSegmentFail}
        onSegmentConnect={onSegmentConnect}
      />
      <LinksCanvas nodes={schema.nodes} links={schema.links} segment={segment} onChange={onLinkDelete} />
    </DiagramCanvas>
  )
}

Diagram.defaultProps = {
  schema: { nodes: [], links: [] },
  onChange: undefined,
  display: { show: () => { } },
  config: {}
}

export default React.memo(Diagram)
