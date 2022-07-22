import { childrenOf, collapsibleFrom, exposedPorts, rootsIn, splitSchema } from "../../shared/functions/schemaMethods"
import { Schema, Node } from "../../shared/Types"

const nId = { current: 0 }

const getSelectedIds = (schema: Schema): string[] => {
  return schema.nodes.filter(node => node.selected).map(node => node.id)
}

const select = (
  ids: Set<string>, { nodes, links }: Schema, single: boolean
): Schema => ({
  nodes: nodes.map(node => {
    if (ids.has(node.id)) {
      return { ...node, selected: true }
    } else if (single) {
      return { ...node, selected: false }
    } else return node
  }),
  links
})

const collapseFrom = (id: string, schema: Schema): Schema => {
  // the selected node within the schema
  const selNode = schema.nodes.find(node => node.id === id)!

  // split up the schema and calculate the exposed ports
  const ids = collapsibleFrom([id], schema)
  ids.add(id)
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
  const toExpand = schema.nodes.find(node => node.id === id)!
  const { data: { collapsed }, coordinates: coords } = toExpand
  if (collapsed === undefined) return schema

  const root = rootsIn(collapsed).keys().next().value

  // reverse the offset transformation on nodes
  const inSchema = {
    nodes: collapsed.nodes.map(({ coordinates, ...node }) => ({
      ...node, coordinates: [
        coordinates[0] + coords[0],
        coordinates[1] + coords[1]
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

const methods = {
  removeNode(node: Partial<Node>) { },
  onChange(schema: Partial<Schema>) { },
}

const actions = {
  deleteNode: (id: string) => {
    methods.removeNode({ id })
  },
  selectChildren: (id: string, schema: Schema) => {
    const children = childrenOf([id], schema)
    children.add(id)
    methods.onChange(select(children, schema, true))
  },
  selectCollapsible: (id: string, schema: Schema) => {
    const children = collapsibleFrom([id], schema)
    children.add(id)
    methods.onChange(select(children, schema, true))
  },
  collapse: (id: string, schema: Schema) => {
    methods.onChange(collapseFrom(id, schema))
  },
  expand: (id: string, schema: Schema) => {
    methods.onChange(expandFrom(id, schema))
  }
}

export const DiagramMenu = ({ schema, onChange }) => {

}