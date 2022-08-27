import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  HTMLAttributes
} from 'react'
import DiagramCanvas from './DiagramCanvas/DiagramCanvas'
import NodesCanvas from './NodesCanvas/NodesCanvas'
import LinksCanvas from './LinksCanvas/LinksCanvas'

import {
  Link,
  Node,
  PortAlignment,
  Schema,
  ElementObject,
  defaultSchema,
  vacuouslyTrue,
  ClickEvent
} from '../shared/Types'

export interface Segment {
  id: string
  from: [number, number]
  to: [number, number]
  alignment?: PortAlignment
}

interface Config {
  /** A ref to fill with a debug callback */
  displayRef?: { current: () => void }
  /** Whether a link should be added to the schema */
  shouldLink?: (link: Link, schema: Schema) => boolean
  /** A callback for clicking on a node */
  onNodeClick?: (ev: ClickEvent, node: Node) => void
  /** A callback for clicking on a schema link */
  onLinkClick?: (ev: ClickEvent, link: Link) => void
  /** A callback for clicking on the background */
  onCanvasClick?: (ev: ClickEvent) => void
}

const defaultConfig: Config = {
  displayRef: { current: () => {} },
  shouldLink: vacuouslyTrue,
  onNodeClick: () => {},
  onLinkClick: () => {},
  onCanvasClick: () => {}
}

interface DiagramProps
  extends Config,
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * The diagram current schema
   */
  schema?: Schema
  /**
   * The callback to be performed every time the model changes
   */
  onChange?: (schema: Partial<Schema>) => void
}

/**
 * The Diagram component is the root-node of any diagram.<br />
 * It accepts a `schema` prop defining the current state of the diagram and emits its possible changes through the
 * `onChange` prop, allowing the developer to have the best possible control over the diagram and its interactions
 * with the user.
 * `config` prop for additional control over the logic of the diagram.
 */
const Diagram = ({
  schema = defaultSchema,
  onChange = undefined,
  displayRef = defaultConfig.displayRef,
  shouldLink = defaultConfig.shouldLink,
  onNodeClick = defaultConfig.onNodeClick,
  onLinkClick = defaultConfig.onLinkClick,
  onCanvasClick = defaultConfig.onCanvasClick,
  ...rest
}: DiagramProps) => {
  const [segment, setSegment] = useState<Segment>()
  const { current: portElems } = useRef<ElementObject>({}) // keeps the port elements references
  const { current: nodeElems } = useRef<ElementObject>({}) // keeps the node elements references

  useEffect(() => {
    displayRef.current = () => {
      console.group('%cNew references', 'color: green')
      for (let id in portElems) {
        console.log(id)
        console.log(portElems[id])
      }
      for (let id in nodeElems) {
        console.log(id)
        console.log(nodeElems[id])
      }
      console.groupEnd()
    }
  })

  // when nodes change, performs the onChange callback with the new incoming data
  const onNodesChange = (nextNodes: Node[]) => {
    if (onChange) onChange({ nodes: nextNodes })
  }

  // when a port is registered, save it to the local reference
  const onPortRegister = useCallback(
    (portId: string, portEl: HTMLElement) => {
      portElems[portId] = portEl
    },
    [portElems]
  )

  // when a node is registered, save it to the local reference
  const onNodeRegister = useCallback(
    (nodeId: string, nodeEl: HTMLElement) => {
      nodeElems[nodeId] = nodeEl
    },
    [nodeElems]
  )

  // when a node is deleted, remove its references
  const onNodeRemove = useCallback(
    (nodeId: string, inputsPorts: string[], outputsPorts: string[]) => {
      delete nodeElems[nodeId]
      inputsPorts.forEach(input => delete portElems[input])
      outputsPorts.forEach(output => delete portElems[output])
    },
    [nodeElems, portElems]
  )

  // when a new segment is dragged, save it to the local state
  const onDragNewSegment = useCallback(
    (
      portId: string,
      from: [number, number],
      to: [number, number],
      alignment?: PortAlignment
    ) => {
      setSegment({ id: `segment-${portId}`, from, to, alignment })
    },
    []
  )

  // when a segment fails to connect, reset the segment state
  const onSegmentFail = useCallback(() => {
    setSegment(undefined)
  }, [])

  // when a segment connects, update the links schema, perform the onChange callback
  // with the new data, then reset the segment state
  const onSegmentConnect = (input: string, output: string) => {
    if (shouldLink({ input, output }, schema)) {
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
        onNodeClick={onNodeClick}
      />
      <LinksCanvas
        nodes={schema.nodes}
        links={schema.links}
        segment={segment!}
        onChange={onLinkDelete}
        onLinkClick={onLinkClick}
        onCanvasClick={onCanvasClick}
      />
    </DiagramCanvas>
  )
}

export default React.memo(Diagram)
