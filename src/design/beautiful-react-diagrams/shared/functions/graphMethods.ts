import { Node, Link, Schema, Port } from "../Types-ts";
import { difference, intersect } from "./setMethods"

type Graph = { [id: string]: string[] }

/**
 * Creates a linked list representation of the graph from the schema
 * A linked list representation is as so:
 * ```
 * {[n0.id]: [n3.id, n9.id, ..., n2.id],
 *  [n1.id]: [n2.id, n4.id, ..., n7.id],
 *  ...,
 *  [n9.id]: [n0.id, n4.id, ..., n1.id]}
 * ```
 * 
 * @param schema The schema to convert from
 * @return The linked list representation
 */
const toGraph = (schema: Schema): Graph => {
  let graph = {}, inPorts = {}, outPorts = {}
  for (let node of schema.nodes) {
    graph[node.id] = []
    for (let port of node.inputs || []) inPorts[port.id] = node.id
    for (let port of node.outputs || []) outPorts[port.id] = node.id
  }

  for (let { input, output } of schema.links) {
    if (outPorts[output] && inPorts[input]) {
      graph[inPorts[input]].push(outPorts[output])
    }
    if (inPorts[output] && outPorts[input]) {
      graph[inPorts[output]].push(outPorts[input])
    }
  }

  return graph
}

/**
 * Uses a breadth search to find all direct descendants of a node
 * (importantly, this doesn't include the node itself)
 * 
 * @param id The id of the node to search from
 * @param graph The linked list graph to search within
 * @return The ids of all direct descendants
 */
const graphChildren = (ids: string[], graph: Graph): Set<string> => {
  let queue = ids
  let seen = new Set<string>()

  while (queue.length > 0) {
    let id = queue.shift()
    if (graph[id] !== undefined) {
      for (let sub of graph[id]) {
        if (!seen.has(sub)) {
          queue.push(sub)
          seen.add(sub)
        }
      }
    }
  }

  return seen
}

export const childrenOf = (id: string, schema: Schema): Set<string> => {
  return graphChildren([id], toGraph(schema))
}

/**
 * Tests whether there is a cycle in the graph containing the specified node
 * 
 * @param id The id of the node to check from
 * @param schema The schema to check within
 */
export const cycleWith = (id: string, schema: Schema): boolean => {
  return childrenOf(id, schema).has(id)
}

/** Flips the direction of all links in a graph */
const reverse = (graph: Graph): Graph => {
  const reversed = {}
  for (let id in graph) reversed[id] = []

  for (let id in graph) {
    for (let cId of graph[id]) {
      reversed[cId].push(id)
    }
  }
  return reversed
}

/** Transforms a graph into an undirected graph */
const undirect = (graph: Graph): Graph => {
  const undirected = {}
  for (let id in graph) undirected[id] = []

  for (let id in graph) {
    for (let cId of graph[id]) {
      undirected[cId].push(id)
      undirected[id].push(cId)
    }
  }
  return undirected
}

/** Finds **all** roots in a given graph */
const graphRoots = (graph: Graph): Set<string> => {
  const reversed = reverse(graph)
  const nodeIds = Object.keys(reversed)
  return new Set(nodeIds.filter(id => reversed[id].length == 0))
}

/** Finds **all** roots in a schema */
export const rootsIn = (schema: Schema): Set<string> => {
  return graphRoots(toGraph(schema))
}

/** Finds all roots within a graph accessible from a node */
const graphRootsFrom = (id: string, graph: Graph): Set<string> => {
  const connected = graphChildren([id], undirect(graph))
  return intersect(graphRoots(graph), connected)
}

/**
 * Uses a breadth first search to find all nodes
 * that **only** contribute to the given node
 */
export const collapsibleFrom = (id: string, schema: Schema): Set<string> => {
  const graph = toGraph(schema)

  // nodes accessible from the id
  const children1 = graphChildren([id], graph)

  // nodes accessible from in the graph without the node
  const rootSet = graphRootsFrom(id, graph)
  let roots = Array.from(rootSet)
  delete graph[id]
  const children2 = graphChildren(roots, graph)

  // nodes only accessible from the node
  return difference(children1, children2)
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
const portToNode = (schema: Schema): { [portId: string]: string } => {
  let outMap = {}
  for (let node of schema.nodes) {
    for (let port of node.outputs) outMap[port.id] = node.id
  }

  let portMap = {}
  for (let { input, output } of schema.links) {
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
  let portMap = portToNode(schema)
  let nodes = schema.nodes.filter(node => ids.has(node.id))
  let ports = nodes.map(node => node.inputs).flat()
  return ports.filter(({ id }) => !ids.has(portMap[id]))
}

/**
 * Splits nodes into internal nodes and other nodes
 */
const splitNodes = (
  ids: Set<string>, schema: Schema
): { inNodes: Node[], outNodes: Node[] } => {
  let inNodes = [], outNodes = []
  for (let node of schema.nodes) {
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
): { inLinks: Link[], outLinks: Link[] } => {
  let inPorts = {}, outPorts = {}
  for (let node of schema.nodes) if (ids.has(node.id)) {
    for (let port of node.inputs) inPorts[port.id] = node.id
    for (let port of node.outputs) outPorts[port.id] = node.id
  }

  let inLinks = [], outLinks = []
  for (let link of schema.links) {
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
): { inSchema: Schema, outSchema: Schema } => {
  const { inNodes, outNodes } = splitNodes(ids, schema)
  const { inLinks, outLinks } = splitLinks(ids, schema)
  return {
    inSchema: { nodes: inNodes, links: inLinks },
    outSchema: { nodes: outNodes, links: outLinks }
  }
}