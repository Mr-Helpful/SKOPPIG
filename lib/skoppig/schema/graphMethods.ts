import { Schema } from '../../beautiful-react-diagrams'
import { intersect } from '../../../src/DiagramMenu/setMethods'

type Graph = { [id: string]: string[] }

type IdMap = { [id: string]: string }
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
export const toGraph = (schema: Schema): Graph => {
  let graph: Graph = {}
  let inPorts: IdMap = {}
  let outPorts: IdMap = {}
  for (const node of schema.nodes) {
    graph[node.id] = []
    for (const port of node.inputs || []) inPorts[port.id] = node.id
    for (const port of node.outputs || []) outPorts[port.id] = node.id
  }

  for (const { input, output } of schema.links) {
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
 * Uses a breadth search to find all direct descendants of nodes
 * (importantly, this doesn't include the nodes themselves)
 *
 * @param id The id of the node to search from
 * @param graph The linked list graph to search within
 * @return The ids of all direct descendants
 */
export const graphChildren = (ids: string[], graph: Graph): Set<string> => {
  let queue = [...ids]
  let seen = new Set<string>()

  while (queue.length > 0) {
    const id = queue.shift()
    if (id !== undefined && graph[id] !== undefined) {
      for (const sub of graph[id]) {
        if (!seen.has(sub)) {
          queue.push(sub)
          seen.add(sub)
        }
      }
    }
  }

  return seen
}

/** Flips the direction of all links in a graph */
const reverse = (graph: Graph): Graph => {
  let reversed: Graph = {}
  for (const id in graph) reversed[id] = []

  for (const id in graph) {
    for (const cId of graph[id]) {
      reversed[cId].push(id)
    }
  }
  return reversed
}

/** Transforms a graph into an undirected graph */
const undirect = (graph: Graph): Graph => {
  let undirected: Graph = {}
  for (const id in graph) undirected[id] = []

  for (const id in graph) {
    for (const cId of graph[id]) {
      undirected[cId].push(id)
      undirected[id].push(cId)
    }
  }
  return undirected
}

/** Finds **all** roots in a given graph */
export const graphRoots = (graph: Graph): Set<string> => {
  const reversed = reverse(graph)
  const nodeIds = Object.keys(reversed)
  return new Set(nodeIds.filter(id => reversed[id].length == 0))
}

/** Finds all roots within a graph accessible from nodes */
export const graphRootsFrom = (ids: string[], graph: Graph): Set<string> => {
  const connected = graphChildren(ids, undirect(graph))
  return intersect(graphRoots(graph), connected)
}
