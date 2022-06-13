import { useCallback, useEffect, useRef } from 'react'
import { Diagram, useSchema, createSchema } from '../dagRender'
import { CustomNode, } from './CustomElems'
import { childrenOf, collapsibleFrom } from '../dagRender/shared/functions/graphMethods'
import { Schema } from '../dagRender/shared/Types-ts'

let nId = 0, pId = 0

export const BrushDiagram = (initialSchema) => {
  const schemaRef = useRef<Schema>({
    nodes: [], links: []
  })

  const methodsRef = useRef({
    onChange: (schema) => { },
    addNode: (node) => { },
    removeNode: (node) => { }
  })

  const startSchema = createSchema(initialSchema)

  const [schema, { onChange, addNode, removeNode }] = useSchema(startSchema)

  useEffect(() => {
    schemaRef.current = schema
  }, [schema])

  useEffect(() => {
    methodsRef.current = { onChange, addNode, removeNode }
  }, [onChange, addNode, removeNode])

  const addOne = useCallback(() => {
    addNode({
      id: `node-${nId++}`,
      content: (<div>
        Node <div />
        content
      </div>),
      coordinates: [125, 250],
      inputs: [
        {
          id: `port-${pId++}`, alignment: 'bottom',
          className: 'circle-port'
        },
        {
          id: `port-${pId++}`, alignment: 'bottom',
          className: 'circle-port'
        },
      ],
      outputs: [
        {
          id: `port-${pId++}`, alignment: 'top',
          className: 'circle-port'
        },
      ],
      render: CustomNode,
      data: {
        selected: false,
        deleteNode: (id: string) => {
          methodsRef.current.removeNode({ id })
        },
        selectChildren: (id: string) => {
          const children = childrenOf(id, schemaRef.current)
          children.add(id)
          methodsRef.current.onChange({
            nodes: schemaRef.current.nodes.map(({ id, data, ...node }) => {
              const dCopy = { ...data, selected: children.has(id) }
              return { ...node, id, data: dCopy }
            })
          })
        },
        selectCollapsible: (id: string) => {
          const children = collapsibleFrom(id, schemaRef.current)
          children.add(id)
          methodsRef.current.onChange({
            nodes: schemaRef.current.nodes.map(({ id, data, ...node }) => {
              const dCopy = { ...data, selected: children.has(id) }
              return { ...node, id, data: dCopy }
            })
          })
        }
      }
    })
  }, [addNode, onChange])

  return <div style={{ width: '100%', height: '22.5rem' }}>
    <Diagram schema={schema} onChange={onChange} />
    <button onClick={addOne}>Add a node!</button>
  </div>
}