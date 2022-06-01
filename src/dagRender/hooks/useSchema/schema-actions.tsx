import { Link, Node, Schema } from "../../shared/Types-ts";
import getNodePortsId from "../../shared/functions/getNodePortsId";
import { Dispatch, SetStateAction } from "react";

export class SchemaActions {
  constructor(
    private setSchema: Dispatch<SetStateAction<Schema>>
  ) { }

  onChange(schema: Partial<Schema>) {
    this.setSchema(({ nodes, links }) => {
      return { nodes: schema.nodes ?? nodes, links: schema.links ?? links }
    })
  }


  addNode(node: Node<any>) {
    this.setSchema(({ nodes, links }) => {
      return { nodes: [node, ...nodes], links }
    })
  }


  removeNode(node: Node<any>) {
    this.setSchema(({ nodes, links }) => {
      const schemaNode = nodes.filter(n => n.id === node.id)[0]
      if (schemaNode === undefined) return { nodes, links }

      const inPorts = getNodePortsId(schemaNode, 'inputs')
      const outPorts = getNodePortsId(schemaNode, 'outputs')

      return {
        nodes: nodes.filter(n => n.id !== node.id),
        links: links.filter(link =>
          !inPorts.includes(link.input) &&
          !outPorts.includes(link.output)
        )
      }
    })
  }


  connect(link: Link) {
    this.setSchema(({ nodes, links }) => {
      return { nodes, links: [link, ...links] }
    })
  }
}