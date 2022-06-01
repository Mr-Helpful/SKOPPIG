import { Schema } from "../Types-ts";

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
 * @param schema The schema to search within
 * @return The ids of all direct descendants
 */
export const allChildren = (id: string, schema: Schema): Set<string> => {
  let graph = toGraph(schema)
  let seen = new Set<string>()
  let queue = [id]

  while (queue.length > 0) {
    id = queue.shift()
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

/**
 * Tests whether there is a cycle in the graph containing the specified node
 * 
 * @param id The id of the node to check from
 * @param schema The schema to check within
 */
export const cycleWith = (id: string, schema: Schema): boolean => {
  return allChildren(id, schema).has(id)
}