import { MutableRefObject } from "react"
import { Schema, Node, Link } from "../../shared/Types"
import { childrenOf, collapsibleFrom, exposedPorts, minimalCollapsible, rootsFrom, rootsIn, splitSchema } from "../../shared/functions/schemaMethods"
import { toArray } from "../../shared/functions/setMethods"

export class MenuActions {
  constructor(
    private idRef: MutableRefObject<number>,
    private schema: Schema,
    private onChange: (schema: Schema) => void
  ) { }

  /** Finds all currently selected nodes in the schema */
  private selectedIds(schema: Schema): string[] {
    return schema.nodes.filter(node => node.selected).map(node => node.id)
  }

  /** Selects all nodes in a schema from a given set */
  private selectIn(ids: Set<string>, schema: Schema, single: boolean): Schema {
    return {
      nodes: schema.nodes.map(node => {
        if (ids.has(node.id)) {
          return { ...node, selected: true }
        } else if (single) {
          return { ...node, selected: false }
        } else return node
      }),
      links: schema.links
    }
  }

  /*----------------------------------------------------------------
  -                       Selecting children                       -
  ----------------------------------------------------------------*/

  /** Selects all children of the current set of nodes */
  children() {
    const selected = this.selectedIds(this.schema)
    const children = childrenOf(selected, this.schema)
    this.onChange(this.selectIn(children, this.schema, false))
  }

  /*----------------------------------------------------------------
  -                        Collapsing nodes                        -
  ----------------------------------------------------------------*/

  /** Collapses all nodes that are directly accessible from a given id */
  private collapseFrom(id: string, schema: Schema): Schema {
    const toCollapse = schema.nodes.find(node => node.id === id)!

    // split up the schema and calculate the exposed ports
    const ids = collapsibleFrom([id], schema)
    ids.add(id) // collapsibleFrom doesn't include the node to collapse
    const { inSchema, outSchema } = splitSchema(ids, schema)
    const ports = exposedPorts(ids, schema)

    // we set coordinates relative to the collapsed node
    const collapsed = {
      nodes: inSchema.nodes.map(({ coordinates, ...node }) => ({
        ...node, coordinates: [
          coordinates[0] - toCollapse.coordinates[0],
          coordinates[1] - toCollapse.coordinates[1]
        ]
      })),
      links: inSchema.links
    }

    // the new node to replace the subgraph with
    const replacement: Node = {
      ...toCollapse, id: `node-${this.idRef.current++}`, inputs: ports,
      data: { collapsed, ...toCollapse.data }
    }

    // create the new schema using the 'out' schema and new node we generated
    return {
      nodes: [replacement, ...outSchema.nodes],
      links: outSchema.links
    }
  }

  /** Attempt to collapse all the currently selected nodes in the schema
   * 
   * We do this by finding all the common roots within the selected nodes and
   * iteratively collapsing them
   * 
   * TODO: find a way to determine collapsible subsets of a set of nodes
   *  - we want to collapse the minimal number of nodes that can acheive the 
   *    same effect as collapsing all the nodes
   *  - mostly as this leads to the most expected behaviour
   * 
   * Example:
   * ```
   * from this.schema:
   * o   x   o   o   x   x
   *  ╲ ╱ ╲ ╱ ╲ ╱ ╲ ╱ ╲ ╱
   *   x   x   x   o   x
   *  ╱ ╲ ╱ ╲ ╱ ╲ ╱ ╲ ╱ ╲
   * x   x   o   x   x   x
   * 
   * we calculate an inSchema:
   *     x           x   x
   *    ╱ ╲           ╲ ╱
   *   x   x   x       x
   *  ╱ ╲ ╱     ╲     ╱ ╲
   * x   x       x   x   x
   * 
   * find it's roots:
   *     x           x   x
   *    ╱ ╲           ╲ ╱
   *   o   o   x       o
   *  ╱ ╲ ╱     ╲     ╱ ╲
   * o   o       o   o   o
   * 
   * and attempt to collapse all of them:
   * o   x   o   o   x   x
   *  ╲ ╱ ╲ ╱ ╲ ╱ ╲ ╱ ╲ ╱
   *   x   x   x   o   x
   *  ╱ ╲ ╱     ╲   ╲ ╱ ╲
   * x   x       x   x   x
   * ```
   */
  collapse() {
    // we can collapse all the nodes selected by finding their common root
    const selected = this.selectedIds(this.schema)
    const toCollapse = minimalCollapsible(selected, this.schema)

  }

  /*----------------------------------------------------------------
  -                        Expanding nodes                         -
  ----------------------------------------------------------------*/

  /** Expand a currently collapsed node within a schema */
  private expandFrom(id: string, schema: Schema): Schema {
    const toExpand = schema.nodes.find(node => node.id === id)!
    const { data: { collapsed }, coordinates: coords } = toExpand
    if (collapsed === undefined) return schema

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

  /** Expand all the currently selected nodes in the schema
   * 
   * Example:
   * ```
   * this.schema:
   *     x           x   x
   *                  ╲ ╱
   *           x       o
   *                  ╱ ╲
   *                 o   o
   * ```
   */
  expand() {
    // find all the selected nodes in the graph
    const selected = this.selectedIds(this.schema)

    // calculate the new schema from expanding all nodes
    let schema = this.schema
    for (const node of selected) {
      schema = this.expandFrom(node, schema)
    }

    this.onChange(schema)
  }
}