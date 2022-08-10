import { isValidElement } from 'react'
import ERR from '../Errors'
import { Schema } from '../Types'

/**
 * Validates a schema port object
 */
export const validatePort = (port: any): boolean => {
  if (!port.id) {
    throw ERR.INVALID_PORT_ID()
  }

  if (!!port.canLink && typeof port.canLink !== 'function') {
    throw ERR.INVALID_PORT_CAN_LINK(port.id)
  }

  if (
    !!port.alignment &&
    !['right', 'left', 'top', 'bottom'].includes(port.alignment)
  ) {
    throw ERR.INVALID_PORT_ALIGNMENT(port.id)
  }

  return true
}

/**
 * Validates a schema node object
 */
export const validateNode = (node: any): boolean => {
  if (!node.id) {
    throw ERR.INVALID_ID()
  }

  if (
    !node.coordinates ||
    !Array.isArray(node.coordinates) ||
    node.coordinates.length !== 2
  ) {
    throw ERR.INVALID_COORDS(node.id)
  }

  // eslint-disable-next-line max-len
  if (
    !!node.content &&
    typeof node.content !== 'string' &&
    typeof node.content !== 'function' &&
    !isValidElement(node.content)
  ) {
    throw ERR.INVALID_CONTENT(node.id)
  }

  if (node.inputs) {
    if (!Array.isArray(node.inputs)) {
      throw ERR.INVALID_INPUTS_ARRAY(node.id)
    }

    node.inputs.forEach(validatePort)
  }

  if (node.outputs) {
    if (!Array.isArray(node.outputs)) {
      throw ERR.INVALID_INPUTS_ARRAY(node.id)
    }

    node.outputs.forEach(validatePort)
  }

  return true
}

/**
 * Validates the nodes array
 */
export const validateNodes = (nodes: any[]): boolean => {
  if (!Array.isArray(nodes)) {
    throw ERR.INVALID_NODES_ARRAY()
  }

  nodes.forEach(validateNode)

  return true
}

/**
 * Validates a single links
 */
export const validateLink = (link: any): boolean => {
  if (
    !link.input ||
    !link.output ||
    typeof link.input !== 'string' ||
    typeof link.output !== 'string'
  ) {
    throw ERR.LINK_INVALID_INPUT_OUTPUT()
  }

  if (link.readonly && typeof link.readonly !== 'boolean') {
    throw ERR.LINK_INVALID_READONLY()
  }

  return true
}

/**
 * Validates the links array
 */
export const validateLinks = (links: any[]): boolean => {
  if (!Array.isArray(links)) {
    throw ERR.INVALID_LINKS_ARRAY()
  }

  links.forEach(validateLink)

  return true
}

/**
 * Validates the schema object
 */
export const validateSchema = ({ links, nodes }: Schema): boolean => {
  if (!nodes) {
    throw ERR.MUST_HAVE_NODES()
  }

  return validateLinks(links) && validateNodes(nodes)
}
export default validateSchema
