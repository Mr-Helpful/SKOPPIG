import { Schema } from "../Types-ts";
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

/** Finds all roots within a graph accessible from a node */
const rootsFrom = (id: string, graph: Graph): Set<string> => {
  const connected = graphChildren([id], undirect(graph))
  const reversed = reverse(graph)
  const allRoots = Object.keys(reversed).filter(id => reversed[id].length == 0)
  return intersect(new Set(allRoots), connected)
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
  const rootSet = rootsFrom(id, graph)
  let roots = Array.from(rootSet)
  delete graph[id]
  const children2 = graphChildren(roots, graph)
  return difference(children1, children2)
}