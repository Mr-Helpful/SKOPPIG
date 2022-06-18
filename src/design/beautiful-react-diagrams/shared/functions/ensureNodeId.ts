const ensureNodeId = (node) => {
  // eslint-disable-next-line no-param-reassign
  node.id ||= `node-${Math.random().toString(36).slice(2, 9)}`

  return node
}

export default ensureNodeId
