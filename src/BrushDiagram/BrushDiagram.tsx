import { useCallback, useRef } from 'react'
import {
  Diagram,
  useSchema,
  createSchema
} from '../../lib/beautiful-react-diagrams'
import useKeyDown from './useKeyDown'
import { Schema } from '../../lib/beautiful-react-diagrams/shared/Types'
import DiagramMenu from '../DiagramMenu/DiagramMenu'
import { CustomNode } from './CustomElems'
import styles from './CustomElems.module.scss'

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

export const BrushDiagram = initialSchema => {
  const startSchema = createSchema(initialSchema)
  const [schema, { onChange, addNode, connect }] = useSchema(startSchema)
  const display = useRef(() => {})

  const nId = useRef(0)
  const pId = useRef(0)
  const addOne = useCallback(
    () =>
      addNode({
        id: `node-${nId.current++}`,
        content: (
          <>
            Node <div />
            content
          </>
        ),
        coordinates: [125, 250],
        inputs: new Array(2).fill(0).map(() => ({
          id: `port-${pId.current++}`,
          alignment: 'bottom',
          className: styles.circlePort
        })),
        outputs: [
          {
            id: `port-${pId.current++}`,
            alignment: 'top',
            className: styles.circlePort
          }
        ],
        render: CustomNode,
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
  const multiSelect = useKeyDown('Shift')
  const onNodeSelect = (id?: string) => {
    if (onChange) {
      const nodes = schema.nodes.map(node => {
        if (node.id === id) return { ...node, selected: !node.selected }
        else if (multiSelect) return node
        else return { ...node, selected: false }
      })
      onChange({ nodes })
    }
  }

  return (
    <div style={{ width: '100%', height: '22.5rem' }}>
      <DiagramMenu schema={schema} onChange={onChange} />
      <Diagram
        schema={schema}
        onChange={onChange}
        displayRef={display}
        onNodeClick={(_, { id }) => onNodeSelect(id)}
        onCanvasClick={() => onNodeSelect(undefined)}
      />
      <div onClick={addOne}>Add a node!</div>
      <div onClick={display.current}>Show the refs!</div>
      <div onClick={linkRandom}>Link something!</div>
    </div>
  )
}
