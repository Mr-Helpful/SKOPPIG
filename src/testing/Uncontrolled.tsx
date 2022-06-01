import { cloneElement, useCallback, useEffect } from 'react'
import { Diagram, useSchema, createSchema } from '../dagRender'
import { HStack, Spacer } from '@chakra-ui/react'
import { CustomNode, CustomPort } from './CustomElems'
import { allChildren } from '../dagRender/shared/functions/graphMethods'
import { Schema } from '../dagRender/shared/Types-ts'

let nId = 0, pId = 0

export const UncontrolledDiagram = () => {
  const startSchema = createSchema({
    nodes: [], links: []
  })

  const [schema, { onChange, addNode }] = useSchema(startSchema)

  const addOne = useCallback(() => addNode({
    id: `node-${nId++}`,
    content: 'Start',
    coordinates: [125, 250],
    inputs: [
      {
        id: `port-${pId++}`, alignment: 'bottom',
        className: 'bi-diagram-port-custom'
      },
      {
        id: `port-${pId++}`, alignment: 'bottom',
        className: 'bi-diagram-port-custom'
      },
    ],
    outputs: [
      {
        id: `port-${pId++}`, alignment: 'top',
        className: 'bi-diagram-port-custom'
      },
    ],
    render: CustomNode,
    data: {
      onClick: (id: string) => {
        // const schema = useContext()
        const children = allChildren(id, schema)
        children.add(id)
        onChange({
          nodes: schema.nodes.map(({ id, data, ...node }) => {
            const dCopy = { ...data, selected: children.has(id) }
            return { ...node, id, data: dCopy }
          })
        })
      },
      selected: false
    }
  }), [addNode, onChange])

  const onNodeClick = (id: string, schema: Schema) => {
    const children = allChildren(id, schema)
    children.add(id)
    onChange({
      nodes: schema.nodes.map(({ id, data, ...node }) => {
        const dCopy = { ...data, selected: children.has(id) }
        return { ...node, id, data: dCopy }
      })
    })
  }

  return <div style={{ width: '100%', height: '22.5rem' }}>
    <Diagram schema={schema} onChange={onChange} config={{ onNodeClick }} />
    <button onClick={addOne}>Add a node!</button>
    <div> </div>
    <button
      onClick={() => console.log(allChildren('node-0', schema))}
    >
      Try seletion...
    </button>
  </div>
}