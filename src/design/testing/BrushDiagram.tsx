import { useCallback, useEffect, useRef } from 'react'
import { Diagram, useSchema, createSchema } from '../beautiful-react-diagrams'
import { CustomNode, } from './CustomElems'
import {
  childrenOf,
  collapsibleFrom,
  exposedPorts,
  splitSchema
} from '../beautiful-react-diagrams/shared/functions/graphMethods'
import { Schema } from '../beautiful-react-diagrams/shared/Types-ts'
import styles from './CustomElems.module.scss'

const select = (ids: Set<string>, { nodes, links }: Schema) => ({
  nodes: nodes.map(({ id, data, ...node }) => ({
    id, ...node, data: { ...data, selected: ids.has(id) }
  })), links
})

const collapseFrom = (id: string, schema: Schema): Schema => {
  const ids = collapsibleFrom(id, schema)
  ids.add(id)
  const { inSchema, outSchema } = splitSchema(ids, schema)
  const ports = exposedPorts(ids, schema)
  console.log('exposed ports:')
  console.log(ports)

  // the new node to replace the subgraph with
  const { data, ...node } = schema.nodes.find(node => node.id === id)
  const newNode = {
    ...node, inputs: ports,
    data: { collapsed: inSchema, ...data }
  }
  console.log('new node')
  console.log(newNode)

  // generate the new schema using the 'out' schema and new node
  const newSchema = {
    nodes: [newNode, ...outSchema.nodes],
    links: outSchema.links
  }
  console.log('new schema')
  console.log(newSchema)
  return newSchema
}

export const BrushDiagram = (initialSchema) => {
  const startSchema = createSchema(initialSchema)
  const [schema, { onChange, addNode, removeNode }] = useSchema(startSchema)

  const schemaRef = useRef<Schema>({
    nodes: [], links: []
  })
  useEffect(() => {
    schemaRef.current = schema
  }, [schema])

  const methodsRef = useRef({
    onChange: (schema) => { },
    addNode: (node) => { },
    removeNode: (node) => { }
  })
  useEffect(() => {
    methodsRef.current = { onChange, addNode, removeNode }
  }, [onChange, addNode, removeNode])

  const nId = useRef(0)
  const pId = useRef(0)

  const addOne = useCallback(() => {
    addNode({
      id: `node-${nId.current++}`,
      content: (<div>
        Node <div />
        content
      </div>),
      coordinates: [125, 250],
      inputs: [
        {
          id: `port-${pId.current++}`, alignment: 'bottom',
          className: styles.circlePort
        },
        {
          id: `port-${pId.current++}`, alignment: 'bottom',
          className: styles.circlePort
        },
      ],
      outputs: [
        {
          id: `port-${pId.current++}`, alignment: 'top',
          className: styles.circlePort
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
          methodsRef.current.onChange(select(children, schemaRef.current))
        },
        selectCollapsible: (id: string) => {
          const children = collapsibleFrom(id, schemaRef.current)
          children.add(id)
          methodsRef.current.onChange(select(children, schemaRef.current))
        },
        collapse: (id: string) => {
          const nSchema = collapseFrom(id, schemaRef.current)
          methodsRef.current.onChange(nSchema)
        }
      }
    })
  }, [addNode, onChange])

  return (<div style={{ width: '100%', height: '22.5rem' }}>
    <Diagram schema={schema} onChange={onChange} />
    <div onClick={addOne} style={{ cursor: 'pointer' }}>Add a node!</div>
  </div>)
}