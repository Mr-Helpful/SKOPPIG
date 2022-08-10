import { ElementObject } from '../../shared/Types'
import getRelativePoint from '../../shared/functions/getRelativePoint'
import { DiagramEntity } from '../LinksCanvas/findInvolvedEntity'

/**
 * Return the coordinates of a given entity (node or port)
 */
const getEntityCoordinates = (
  entity: DiagramEntity,
  portRefs: ElementObject | null,
  nodeRefs: ElementObject | null,
  canvas: DOMRect | null
): [number, number] | null => {
  if (
    entity &&
    entity.type === 'node' &&
    nodeRefs !== null &&
    nodeRefs[entity.entity.id]
  ) {
    const nodeEl = nodeRefs[entity.entity.id]
    const bbox = nodeEl.getBoundingClientRect()
    const res: [number, number] = [
      entity.entity.coordinates[0] + bbox.width / 2,
      entity.entity.coordinates[1] + bbox.height / 2
    ]
    return res
  }

  if (entity && portRefs && canvas !== null && portRefs[entity.entity.id]) {
    const portEl = portRefs[entity.entity.id]
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
