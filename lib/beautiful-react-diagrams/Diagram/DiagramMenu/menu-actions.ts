import { Schema, Node } from '../../shared/Types'
import {
  childrenOf,
  collapsibleFrom,
  exposedPorts,
  splitSchema,
  selectedIds,
  selectIn,
} from './schemaMethods'

export class MenuActions {
  constructor(
    private schema: Schema,
    private onChange: (schema: Schema) => void
  ) {}

  /*----------------------------------------------------------------
  -                         Deleting nodes                         -
  ----------------------------------------------------------------*/

  /** Deletes all selected nodes and their links */
  delete() {
    const selected = selectedIds(this.schema)
    const { outSchema } = splitSchema(new Set(selected), this.schema)
    this.onChange(outSchema)
  }

  /*----------------------------------------------------------------
  -                       Selecting children                       -
  ----------------------------------------------------------------*/

  /** Selects all children of the current set of nodes */
  children() {
    const selected = selectedIds(this.schema)
    const children = childrenOf(selected, this.schema)
    this.onChange(selectIn(children, this.schema))
  }

  /*----------------------------------------------------------------
  -                        Collapsing nodes                        -
  ----------------------------------------------------------------*/

  /** Collapses all nodes that are directly accessible from a given id */
  private collapseFrom(schema: Schema, id: string): Schema {
    // console.group('collapseFrom')
    const toCollapse = schema.nodes.find(node => node.id === id)
    if (toCollapse === undefined) return schema

    // split up the schema and calculate the exposed ports
    const ids = collapsibleFrom([id], schema)
    ids.add(id) // collapsibleFrom doesn't include the node to collapse
    // console.log(ids)
    const { inSchema, outSchema } = splitSchema(ids, schema)
    const ports = exposedPorts(ids, schema)

    // we set coordinates relative to the collapsed node
    const collapsed = {
      nodes: inSchema.nodes.map(({ coordinates, ...node }) => ({
        ...node,
        coordinates: [
          coordinates[0] - toCollapse.coordinates[0],
          coordinates[1] - toCollapse.coordinates[1],
        ],
      })),
      links: inSchema.links,
    }

    // determine the lowest possible id that isn't taken
    let newId = 0
    const sortIds = outSchema.nodes.map(({ id }) => id).sort()
    for (const id of sortIds) if (id === `node-${newId}`) newId++

    // the new node to replace the subgraph with
    const replacement: Node = {
      ...toCollapse,
      id: `node-${newId}`,
      inputs: ports,
      data: { collapsed, ...toCollapse.data },
    }

    // create the new schema using the 'out' schema and new node we generated
    const newSchema = {
      nodes: [replacement, ...outSchema.nodes],
      links: outSchema.links,
    }
    // console.log(newSchema)
    // console.groupEnd()
    return newSchema
  }

  /** Attempt to collapse all the currently selected nodes in the schema */
  collapse() {
    // console.group('collapse')
    const selected = selectedIds(this.schema)
    // console.log(`from selected = ${selected}`)
    const nSchema = selected.reduce(this.collapseFrom.bind(this), this.schema)
    // console.groupEnd()
    this.onChange(nSchema)
  }

  /*----------------------------------------------------------------
  -                        Expanding nodes                         -
  ----------------------------------------------------------------*/

  /** Expand a currently collapsed node within a schema */
  private expandFrom(schema: Schema, id: string): Schema {
    // console.group('expandFrom')
    const toExpand = schema.nodes.find(node => node.id === id)!
    const {
      data: { collapsed },
      coordinates: coords,
    } = toExpand
    if (collapsed === undefined) return schema

    // reverse the offset transformation on nodes
    const inSchema = {
      nodes: collapsed.nodes.map(({ coordinates, ...node }) => ({
        ...node,
        coordinates: [coordinates[0] + coords[0], coordinates[1] + coords[1]],
      })),
      links: collapsed.links, //.map(link => ({ ...link })),
    }

    const nextNodes = schema.nodes.filter(node => node.id !== id)
    const res = {
      nodes: [...nextNodes, ...inSchema.nodes],
      links: [...schema.links, ...inSchema.links],
    }
    // console.groupEnd()
    return res
  }

  expand() {
    // console.group('expand')
    const selected = selectedIds(this.schema)
    // console.log(`from selected = ${selected}`)
    const nSchema = selected.reduce(this.expandFrom.bind(this), this.schema)
    // console.log(nSchema)
    // console.groupEnd()
    this.onChange(nSchema)
  }

  /*----------------------------------------------------------------
  -                      Clearing the schema                       -
  ----------------------------------------------------------------*/

  /** Completely clear the schema */
  clear() {
    this.onChange({ nodes: [], links: [] })
  }
}
