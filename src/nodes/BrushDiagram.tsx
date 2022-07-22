import { useCallback, useEffect, useRef } from 'react'
import { Diagram, useSchema, createSchema } from '../../lib/beautiful-react-diagrams'
import { CustomNode } from './CustomElems'
import {
  childrenOf,
  collapsibleFrom,
  exposedPorts,
  rootsIn,
  splitSchema
} from "../../lib/beautiful-react-diagrams/shared/functions/schemaMethods"
import { Schema, Node } from '../../lib/beautiful-react-diagrams/shared/Types'
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

  const { current: display } = useRef({ show: () => { } })

  const select = (ids: Set<string>, { nodes, links }: Schema) => ({
    nodes: nodes.map(({ id, data, ...node }) => ({
      id, ...node, data: { ...data, selected: ids.has(id) }
    })), links
  })

  const collapseFrom = (id: string, schema: Schema): Schema => {
    // the selected node within the schema
    const selNode = schema.nodes.find(node => node.id === id)

    // split up the schema and calculate the exposed ports
    const ids = collapsibleFrom([id], schema).add(id)
    const { inSchema, outSchema } = splitSchema(ids, schema)
    const ports = exposedPorts(ids, schema)

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

    // generate the new schema using the 'out' schema and new node
    const newSchema = {
      nodes: [newNode, ...outSchema.nodes],
      links: outSchema.links
    }
    return newSchema
  }

  const expandFrom = (id: string, schema: Schema): Schema => {
    const selNode = schema.nodes.find(node => node.id === id)
    const { data: { collapsed }, coordinates: selCoords } = selNode
    if (collapsed === undefined) return schema

    const root = rootsIn(collapsed).keys().next().value

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
          const children = childrenOf([id], schemaRef.current)
          children.add(id)
          methodsRef.current.onChange(select(children, schemaRef.current))
        },
        selectCollapsible: (id: string) => {
          const children = collapsibleFrom([id], schemaRef.current)
          children.add(id)
          methodsRef.current.onChange(select(children, schemaRef.current))
        },
        collapse: (id: string) => {
          const nSchema = collapseFrom(id, schemaRef.current)
          methodsRef.current.onChange(nSchema)
        },
        expand: (id: string) => {
          const { nodes, links } = expandFrom(id, schemaRef.current)
          methodsRef.current.onChange({ nodes, links })
          methodsRef.current.onChange({ nodes })
        }
      }
    })
  }, [addNode, onChange])

  return (
    <div style={{ width: '100%', height: '22.5rem' }}>
      <Diagram schema={schema} onChange={onChange} display={display} />
      <div onClick={addOne}>Add a node!</div>
      <div> </div>
      <div onClick={display.show}>Show the refs!</div>
    </div>
  )
}