import { Schema, Node, Link, Port } from "../Types"
import { difference, toArray } from "./setMethods"
import { graphChildren, toGraph, graphRoots, graphRootsFrom } from "./graphMethods"

/** All descendants of nodes within a schema */
export const childrenOf = (ids: string[], schema: Schema): Set<string> => {
  return graphChildren(ids, toGraph(schema))
}

/**
 * Tests whether there is a cycle in the graph containing the specified nodes
 *
 * @param id The id of the node to check from
 * @param schema The schema to check within
 */
export const cycleWith = (ids: string[], schema: Schema): boolean => {
  const children = childrenOf(ids, schema)
  return ids.every(id => children.has(id))
}

/** Finds **all** roots in a schema */
export const rootsIn = (schema: Schema): Set<string> => {
  return graphRoots(toGraph(schema))
}

/** Finds all roots in a schema accessible from nodes */
export const rootsFrom = (ids: string[], schema: Schema): Set<string> => {
  return graphRootsFrom(ids, toGraph(schema))
}

/**
 * Uses a breadth first search to find all nodes
 * that **only** contribute to the given node
 */
export const collapsibleFrom = (ids: string[], schema: Schema): Set<string> => {
  const graph = toGraph(schema)

  // nodes accessible from the id
  const children1 = graphChildren(ids, graph)

  // nodes accessible from in the graph without the node
  const rootSet = graphRootsFrom(ids, graph)
  for (const id of ids) delete graph[id]
  const children2 = graphChildren(toArray(rootSet), graph)

  // nodes only accessible via specified nodes
  return difference(children1, children2)
}

/**
 * Calculates the minimum set of ids that can be collapsed
 * to acheive the same effect as collapsing all specified ids
 */
export const minimalCollapsible = (ids: string[], schema: Schema): Set<string> => {
  const collapsible = collapsibleFrom(ids, schema)
  return difference(new Set(ids), collapsible)
}

/**
 * Generates a mapping from input ports to node ids from a schema
 *
 * Example:
 * ```
 * schema
 *        ┌──────────┐                          ┌──────────┐
 *        │          ├ port1                    │          ├ port5
 *        │          │                          │          │
 *  port0 ┤  node0   ├ port2 ────────┬─── port4 ┤  node1   ├ port6
 *        │          │               │          │          │
 *        │          ├ port3 ────────┘          │          ├ port7
 *        └──────────┘                          └──────────┘
 > { port2: "node1", port3: "node1" }
 * ```
 */
const portToNode = (schema: Schema): { [portId: string]: string; } => {
  let outMap = {}
  for (const node of schema.nodes) {
    for (const port of node.outputs) outMap[port.id] = node.id
  }

  let portMap = {}
  for (const { input, output } of schema.links) {
    if (input in outMap) portMap[output] = outMap[input]
    if (output in outMap) portMap[input] = outMap[output]
  }
  return portMap
}

/**
 * Calculates all ports on the exterior of a given set of nodes
 *
 * Example:
 * ```
 * ids:
 * {node0, node1}
 * schema:
 *        ┌──────────┐                          ┌──────────┐
 *        │          ├ port1                    │          ├ port5
 *        │          │                          │          │
 *  port0 ┤  node0   ├ port2         ┌─── port4 ┤  node1   ├ port6
 *        │          │               │          │          │
 *        │          ├ port3 ────────┘          │          ├ port7
 *        └──────────┘                          └──────────┘
 > { port1, port2, port5, port6, port7} // but **not** port3
 * ```
 */
export const exposedPorts = (ids: Set<string>, schema: Schema): Port[] => {
  const portMap = portToNode(schema)
  const nodes = schema.nodes.filter(node => ids.has(node.id))
  const ports = nodes.map(node => node.inputs).flat()
  return ports.filter(({ id }) => !ids.has(portMap[id]))
}

/**
 * Splits nodes into internal nodes and other nodes
 */
const splitNodes = (
  ids: Set<string>, schema: Schema
): { inNodes: Node[]; outNodes: Node[]; } => {
  let inNodes = [], outNodes = []
  for (const node of schema.nodes) {
    (ids.has(node.id) ? inNodes : outNodes).push(node)
  }
  return { inNodes, outNodes }
}

/**
 * Splits links into internal links and other links,
 * with reference to a set of nodes
 */
const splitLinks = (
  ids: Set<string>, schema: Schema
): { inLinks: Link[]; outLinks: Link[]; } => {
  let inPorts = {}, outPorts = {}
  for (const node of schema.nodes) if (ids.has(node.id)) {
    for (const port of node.inputs) inPorts[port.id] = node.id
    for (const port of node.outputs) outPorts[port.id] = node.id
  }

  let inLinks = [], outLinks = []
  for (const link of schema.links) {
    (((link.input in inPorts && link.output in outPorts) ||
      (link.output in inPorts && link.input in outPorts)
    ) ? inLinks : outLinks).push(link)
  }
  return { inLinks, outLinks }
}

/**
 * Splits a schema into a segment of the graph and everything else,
 * based on the provided set of nodes
 */
export const splitSchema = (
  ids: Set<string>, schema: Schema
): { inSchema: Schema; outSchema: Schema; } => {
  const { inNodes, outNodes } = splitNodes(ids, schema)
  const { inLinks, outLinks } = splitLinks(ids, schema)
  return {
    inSchema: { nodes: inNodes, links: inLinks },
    outSchema: { nodes: outNodes, links: outLinks }
  }
}

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
