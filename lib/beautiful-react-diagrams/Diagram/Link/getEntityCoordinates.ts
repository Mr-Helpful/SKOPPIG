import getRelativePoint from '../../shared/functions/getRelativePoint'
import { DiagramEntity, isNode } from '../LinksCanvas/findInvolvedEntity'

import { ElementObject } from '../../shared/Types'

/**
 * Return the coordinates of a given entity (node or port)
 */
const getEntityCoordinates = (
  entity: DiagramEntity,
  portRefs: ElementObject | null,
  nodeRefs: ElementObject | null,
  canvas: DOMRect | null
): [number, number] | null => {
  if (isNode(entity) && nodeRefs !== null && nodeRefs[entity.id]) {
    const nodeEl = nodeRefs[entity.id]
    const bbox = nodeEl.getBoundingClientRect()
    const res: [number, number] = [
      entity.coordinates[0] + bbox.width / 2,
      entity.coordinates[1] + bbox.height / 2
    ]
    return res
  }

  if (portRefs !== null && canvas !== null && portRefs[entity.id]) {
    const portEl = portRefs[entity.id]
    const bbox = portEl.getBoundingClientRect()

    const res = getRelativePoint(
      [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2],
      [canvas.x, canvas.y]
    )
    return res
  }

  return null
}

export default getEntityCoordinates
