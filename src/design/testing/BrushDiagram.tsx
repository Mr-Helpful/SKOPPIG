import { useCallback, useEffect, useRef } from 'react'
import { Diagram, useSchema, createSchema } from '../beautiful-react-diagrams'
import { CustomNode, } from './CustomElems'
import {
  childrenOf,
  collapsibleFrom,
  exposedPorts,
  rootsIn,
  splitSchema
} from '../beautiful-react-diagrams/shared/functions/graphMethods'
import { Schema, Node } from '../beautiful-react-diagrams/shared/Types-ts'
import styles from './CustomElems.module.scss'

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

  const showRef = useRef({
    show: () => { }
  })

  const select = (ids: Set<string>, { nodes, links }: Schema) => ({
    nodes: nodes.map(({ id, data, ...node }) => ({
      id, ...node, data: { ...data, selected: ids.has(id) }
    })), links
  })

  const collapseFrom = (id: string, schema: Schema): Schema => {
    // the selected node within the schema
    const selNode = schema.nodes.find(node => node.id === id)

    // split up the schema and calculate the exposed ports
    const ids = collapsibleFrom(id, schema)
    ids.add(id)
    const { inSchema, outSchema } = splitSchema(ids, schema)
    const ports = exposedPorts(ids, schema)
    console.log('exposed ports:')
    console.log(ports)

    // we set coordinates relative to the collapsed node
    const offsetSchema = {
      nodes: inSchema.nodes.map(({ coordinates, ...node }) => ({
        ...node, coordinates: [
          coordinates[0] - selNode.coordinates[0],
          coordinates[1] - selNode.coordinates[1]
        ]
      })),
      links: inSchema.links
    }

    // the new node to replace the subgraph with
    const newNode: Node = {
      ...selNode, id: `node-${nId.current++}`, inputs: ports,
      data: { collapsed: offsetSchema, ...selNode.data }
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

  const expandFrom = (id: string, schema: Schema): Schema => {
    const selNode = schema.nodes.find(node => node.id === id)
    const { data: { collapsed }, coordinates: selCoords } = selNode
    if (collapsed === undefined) return schema

    const roots = rootsIn(collapsed)
    const root = roots.keys()[0] // TODO: returns `undefined`!

    // reverse the offset transformation on nodes
    const inSchema = {
      nodes: collapsed.nodes.map(({ coordinates, ...node }) => ({
        ...node, coordinates: [
          coordinates[0] + selCoords[0],
          coordinates[1] + selCoords[1]
        ]
      })),
      links: collapsed.links
    }
    console.log(inSchema)

    const nextNodes = schema.nodes.filter(node => node.id !== id)
    return {
      nodes: [...inSchema.nodes, ...nextNodes],
      links: [...inSchema.links, ...schema.links]
    }
  }

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
        },
        expand: (id: string) => {
          const nSchema = expandFrom(id, schemaRef.current)
          methodsRef.current.onChange(nSchema)
        }
      }
    })
  }, [addNode, onChange])

  return (<div style={{ width: '100%', height: '22.5rem' }}>
    <Diagram schema={schema} onChange={onChange} showRef={showRef} />
    <div onClick={addOne}>Add a node!</div>
    <div> </div>
    <div onClick={showRef.current.show}>Show the refs!</div>
  </div>)
}