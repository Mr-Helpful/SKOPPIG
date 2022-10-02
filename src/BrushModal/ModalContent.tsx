import React, { useCallback, useEffect, useRef } from 'react'
import Diagram, {
  createSchema,
  Schema,
  useSchema,
  Node,
  Link
} from '../../lib/beautiful-react-diagrams'
import DiagramMenu from '../DiagramMenu/DiagramMenu'
import NodeStash from '../NodeStash/NodeStash'
import { ModalBackground } from './Modal'
import { cycleWith } from '../DiagramMenu/schemaMethods'
import { ClickEvent } from '../../lib/beautiful-react-diagrams/shared/Types'
import StashNodes from '../BrushNode/renderNodes'
import { diagram } from '../../lib/development/diagram'

/** Returns a function that can be used to assign unique ids to any node it is
 * called with and its ports
 */
const useIdAssigner = () => {
  const nId = useRef(0)
  const pId = useRef(0)

  return useCallback(
    ({ id, inputs, outputs, ...node }: Node): Node => ({
      id: `node-${nId.current++}`,
      inputs: (inputs ?? []).map(({ id, ...port }) => ({
        id: `port-${pId.current++}`,
        ...port
      })),
      outputs: (outputs ?? []).map(({ id, ...port }) => ({
        id: `port-${pId.current++}`,
        ...port
      })),
      ...node
    }),
    []
  )
}

const noCycles = (link: Link, { nodes, links }: Schema) => {
  // find either of the nodes the link connects
  const { id } = nodes.find(
    ({ inputs, outputs }) =>
      inputs.some(({ id }) => id === link.input) ||
      outputs.some(({ id }) => id === link.input)
  )!
  // and test whether there is a cycle containing this node
  return !cycleWith([id], { nodes, links: [link, ...links] })
}

const notSameType = ({ input, output }: Link, { nodes }: Schema) => {
  // determines the type of a port (i.e. input or output)
  const portType = portId => {
    for (const { inputs, outputs } of nodes) {
      for (const { id } of inputs) if (id === portId) return 'input'
      for (const { id } of outputs) if (id === portId) return 'output'
    }
    throw Error('Port id not found in schema')
  }
  return portType(input) !== portType(output)
}

const shouldLink = (link: Link, schema: Schema) =>
  noCycles(link, schema) && notSameType(link, schema)

const ModalContent = () => {
  const startSchema = createSchema({})
  const [schema, { onChange, addNode }] = useSchema(startSchema)

  useEffect(() => {
    diagram.logSchema = () => {
      console.groupCollapsed('%cNew Schema', 'color: green')
      console.groupCollapsed('%cNodes', 'color: green')
      for (const node of schema.nodes) {
        console.log(node)
      }
      console.groupEnd()
      console.groupCollapsed('%cLinks', 'color: green')
      for (const link of schema.links) {
        console.log(link)
      }
      console.groupEnd()
      console.groupEnd()
    }
  }, [schema])

  // whether to select multiple nodes at once
  const onNodeSelect = useCallback(
    (ev: ClickEvent, { id }: Node) => {
      const selecteds = schema.nodes.filter(({ selected }) => selected)
      const multiSelect = ev.nativeEvent.shiftKey
      const manySelected = selecteds.length > 1

      const nodes = schema.nodes.map(({ selected, ...node }) => {
        if (multiSelect) {
          // if we're holding shift, just toggle clicked node
          if (node.id === id) return { ...node, selected: !selected }
          else return { ...node, selected }
        } else if (manySelected) {
          // if multiple nodes are selected and we're not holding shift,
          // then only select the clicked node
          if (node.id === id) return { ...node, selected: true }
          else return { ...node, selected: false }
        } else {
          // if only one node is selected and we're not holding shift,
          // then toggle the clicked node
          if (node.id === id) return { ...node, selected: !selected }
          else return { ...node, selected: false }
        }
      })
      onChange({ nodes })
    },
    [schema, onChange]
  )

  return (
    <>
      <DiagramMenu schema={schema} onChange={onChange} />
      <NodeStash nodes={StashNodes} addOne={addNode} />
      <ModalBackground>
        <Diagram
          schema={schema}
          onChange={onChange}
          shouldLink={shouldLink}
          onNodeClick={onNodeSelect}
          onCanvasClick={ev =>
            onNodeSelect(ev, {
              id: '',
              coordinates: [0, 0]
            })
          }
        />
      </ModalBackground>
    </>
  )
}

export default React.memo(ModalContent)
