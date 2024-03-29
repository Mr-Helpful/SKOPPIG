import { Schema } from '../Types'
import ensureNodeIds from './ensureNodeId'
import { validateSchema } from './validators'

/**
 * takes a schema draft and ensure it is a valid schema
 */
const createSchema = (schema: any): Schema => {
  const next = { ...schema }

  next.nodes ||= []
  next.links ||= []

  next.nodes.forEach(ensureNodeIds)

  validateSchema(next)

  return next
}

export default createSchema
