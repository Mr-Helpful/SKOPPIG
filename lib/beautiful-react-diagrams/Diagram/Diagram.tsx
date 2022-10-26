import React, { useState, useRef, useEffect, HTMLAttributes } from 'react'
import DiagramCanvas from './DiagramCanvas/DiagramCanvas'
import NodesCanvas from './NodesCanvas/NodesCanvas'
import LinksCanvas from './LinksCanvas/LinksCanvas'
import MethodProvider from './MethodContext/MethodContext'

import {
  Segment,
  Link,
  Node,
  Schema,
  ElementObject,
  defaultSchema,
  vacuouslyTrue,
  ClickEvent
} from '../shared/Types'
import { diagram } from '../../development/diagram'

export interface DiagramConfig {
  /** Whether a link should be added to the schema */
  shouldLink?: (link: Link, schema: Schema) => boolean

  /** A useEffect like hook for node mounting */
  onNodeMount?: (node: Node) => void | (() => void)
  /** A useEffect like hook for link mounting */
  onLinkMount?: (link: Link) => void | (() => void)

  /** A callback for clicking on a node */
  onNodeClick?: (ev: ClickEvent, node: Node) => void
  /** A callback for clicking on a schema link */
  onLinkClick?: (ev: ClickEvent, link: Link) => void
  /** A callback for clicking on the background */
  onCanvasClick?: (ev: ClickEvent) => void
}

export const defaultConfig: DiagramConfig = {
  shouldLink: vacuouslyTrue,

  onNodeMount(_) {},
  onLinkMount(_) {},

  onNodeClick(_1, _2) {},
  onLinkClick(_1, _2) {},
  onCanvasClick(_) {}
}

interface DiagramProps
  extends DiagramConfig,
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
  shouldLink = defaultConfig.shouldLink,

  onNodeMount = defaultConfig.onNodeMount,
  onLinkMount = defaultConfig.onLinkMount,

  onNodeClick = defaultConfig.onNodeClick,
  onLinkClick = defaultConfig.onLinkClick,
  onCanvasClick = defaultConfig.onCanvasClick,
  ...rest
}: DiagramProps) => {
  const [segment, setSegment] = useState<Segment>()
  const { current: portElems } = useRef<ElementObject>({}) // keeps the port elements references
  const { current: nodeElems } = useRef<ElementObject>({}) // keeps the node elements references

  useEffect(() => {
    diagram.showRefs = () => {
      console.groupCollapsed('%cNew references', 'color: green')
      const maxLength = Math.max(
        ...Object.keys(portElems).map(s => s.length),
        ...Object.keys(portElems).map(s => s.length)
      )
      console.groupCollapsed('%cPort references', 'color: green')
      for (let id in portElems) {
        const key = id.padEnd(maxLength)
        console.log(key, portElems[id])
      }
      console.groupEnd()
      console.groupCollapsed('%cNode references', 'color: green')
      for (let id in nodeElems) {
        const key = id.padEnd(maxLength)
        console.log(key, nodeElems[id])
      }
      console.groupEnd()
      console.groupEnd()
    }
  })

  return (
    <DiagramCanvas portRefs={portElems} nodeRefs={nodeElems} {...rest}>
      <MethodProvider
        value={{
          schema,
          config: {
            shouldLink,
            onNodeMount,
            onLinkMount,
            onNodeClick,
            onLinkClick,
            onCanvasClick
          },
          onChange,
          setSegment
        }}
      >
        <NodesCanvas nodes={schema.nodes} />
        <LinksCanvas
          nodes={schema.nodes}
          links={schema.links}
          segment={segment}
        />
      </MethodProvider>
    </DiagramCanvas>
  )
}

export default React.memo(Diagram)
