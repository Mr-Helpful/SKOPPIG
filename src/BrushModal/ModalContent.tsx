import React, { useCallback, useRef } from 'react'
import Diagram, {
  createSchema,
  Schema,
  useSchema,
  Node,
  Link
} from '../../lib/beautiful-react-diagrams'
import BrushNode from '../BrushNode/BrushNode'
import DiagramMenu from '../DiagramMenu/DiagramMenu'
import NodeStash from '../NodeStash/NodeStash'
import { ModalBackground } from './Modal'
import { RiImage2Line } from 'react-icons/ri'
import { cycleWith } from '../DiagramMenu/schemaMethods'
import { ClickEvent } from '../../lib/beautiful-react-diagrams/shared/Types'

const unlinked = (schema: Schema): { input: string; output: string }[] => {
  const inputs: string[] = schema.nodes
    .map(node => (node.inputs ?? []).map(({ id }) => id))
    .flat()
  const outputs: string[] = schema.nodes
    .map(node => (node.outputs ?? []).map(({ id }) => id))
    .flat()
  const links = inputs
    .map(input => outputs.map(output => ({ input, output })))
    .flat()
  return links.filter(({ input, output }) =>
    schema.links.every(
      link =>
        (link.input !== input || link.output !== output) &&
        (link.input !== output || link.output !== input)
    )
  )
}

const defaultNodes: Node[] = [
  {
    id: '',
    content: <RiImage2Line size={50} />,
    coordinates: [125, 250],
    selected: false,
    inputs: new Array(2).fill(0).map((_, i) => ({
      id: '',
      alignment: 'bottom'
    })),
    outputs: new Array(1).fill(0).map((_, i) => ({
      id: '',
      alignment: 'top'
    })),
    render: BrushNode,
    data: {}
  }
]

const unusedNode: Node = { id: undefined, coordinates: [0, 0] }

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
    [nId, pId]
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

const ModalContent = () => {
  const startSchema = createSchema({})
  const [schema, { onChange, addNode, connect }] = useSchema(startSchema)
  const display = useRef(() => {})

  const assigner = useIdAssigner()
  const addOne = useCallback(
    () => addNode(assigner(defaultNodes[0])),
    [addNode, assigner]
  )

  const linkRandom = useCallback(() => {
    const links = unlinked(schema)
    if (links.length === 0) return
    const link = links[Math.floor(Math.random() * links.length)]
    connect(link.input, link.output)
  }, [schema, connect])

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
      <NodeStash nodes={defaultNodes.map(assigner)} />
      <div onClick={addOne}>Add a node!</div>
      <div onClick={display.current}>Show the refs!</div>
      <div onClick={linkRandom}>Link something!</div>
      <ModalBackground>
        <Diagram
          schema={schema}
          onChange={onChange}
          displayRef={display}
          shouldLink={noCycles}
          onNodeClick={onNodeSelect}
          onCanvasClick={ev => onNodeSelect(ev, unusedNode)}
        />
      </ModalBackground>
    </>
  )
}

export default React.memo(ModalContent)
