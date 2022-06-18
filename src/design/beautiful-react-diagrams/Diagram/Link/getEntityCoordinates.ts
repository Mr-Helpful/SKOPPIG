import { ElementObject } from '../../Context/DiagramContext'
import getRelativePoint from '../../shared/functions/getRelativePoint'
import { DiagramEntity } from '../LinksCanvas/findInvolvedEntity'

/**
 * Return the coordinates of a given entity (node or port)
 */
const getEntityCoordinates = (entity: DiagramEntity, portRefs: ElementObject, nodeRefs: ElementObject, canvas: DOMRect): [number, number] => {
  if (entity && entity.type === 'node' && nodeRefs[entity.entity.id]) {
    const nodeEl = nodeRefs[entity.entity.id]
    const bbox = nodeEl.getBoundingClientRect()
    return [entity.entity.coordinates[0] + (bbox.width / 2), entity.entity.coordinates[1] + (bbox.height / 2)]
  }

  if (portRefs && portRefs[entity.entity.id]) {
    const portEl = portRefs[entity.entity.id]
    const bbox = portEl.getBoundingClientRect()

    return getRelativePoint([bbox.x + (bbox.width / 2), bbox.y + (bbox.height / 2)], [canvas.x, canvas.y])
  }

  return undefined
}

export default getEntityCoordinates
