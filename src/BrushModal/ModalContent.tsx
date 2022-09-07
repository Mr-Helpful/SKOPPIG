import React, { useCallback, useRef } from 'react'
import { isHotkeyPressed } from 'react-hotkeys-hook'
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
    id: `0`,
    content: <RiImage2Line size={50} />,
    coordinates: [125, 250],
    selected: false,
    inputs: new Array(2).fill(0).map((_, i) => ({
      id: `in${i}`,
      alignment: 'bottom'
    })),
    outputs: new Array(1).fill(0).map((_, i) => ({
      id: `out${i}`,
      alignment: 'top'
    })),
    render: BrushNode,
    data: {}
  }
]

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

  const nId = useRef(0)
  const pId = useRef(0)
  const addOne = useCallback(
    () =>
      addNode({
        id: `node-${nId.current++}`,
        content: <RiImage2Line size={50} />,
        coordinates: [125, 250],
        selected: false,
        inputs: new Array(2).fill(0).map(() => ({
          id: `port-${pId.current++}`,
          alignment: 'bottom'
        })),
        outputs: new Array(1).fill(0).map(() => ({
          id: `port-${pId.current++}`,
          alignment: 'top'
        })),
        render: BrushNode,
        data: {}
      }),
    [addNode]
  )

  const linkRandom = useCallback(() => {
    const links = unlinked(schema)
    if (links.length === 0) return
    const link = links[Math.floor(Math.random() * links.length)]
    connect(link.input, link.output)
  }, [schema, connect])

  // whether to select multiple nodes at once
  const multiSelect = isHotkeyPressed('shift')
  const onNodeSelect = useCallback(
    (id?: string) => {
      if (onChange) {
        const nodes = schema.nodes.map(node => {
          if (node.id === id) return { ...node, selected: !node.selected }
          else if (multiSelect) return node
          else return { ...node, selected: false }
        })
        onChange({ nodes })
      }
    },
    [schema, onChange, multiSelect]
  )

  return (
    <>
      <DiagramMenu schema={schema} onChange={onChange} />
      <NodeStash nodes={defaultNodes} />
      <div onClick={addOne}>Add a node!</div>
      <div onClick={display.current}>Show the refs!</div>
      <div onClick={linkRandom}>Link something!</div>
      <ModalBackground>
        <Diagram
          schema={schema}
          onChange={onChange}
          displayRef={display}
          shouldLink={noCycles}
          onNodeClick={(_, { id }) => onNodeSelect(id)}
          onCanvasClick={() => onNodeSelect(undefined)}
        />
      </ModalBackground>
    </>
  )
}

export default React.memo(ModalContent)
