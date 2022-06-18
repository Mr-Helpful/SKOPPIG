import ensureNodeId from './ensureNodeId'
import { validateSchema } from './validators'

/**
 * takes a schema draft and ensure it is a valid schema
 */
const createSchema = (schema: any) => {
  const next = { ...schema }

  next.nodes ||= []
  next.links ||= []

  next.nodes.forEach(ensureNodeId)

  validateSchema(next)

  return next
}

export default createSchema
