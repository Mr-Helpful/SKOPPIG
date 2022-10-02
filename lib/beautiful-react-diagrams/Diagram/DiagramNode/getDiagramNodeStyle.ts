import { Coords } from '../../shared/Types'

const getDiagramNodeStyle = (coordinates: Coords, disableDrag: boolean) => ({
  left: coordinates[0],
  top: coordinates[1],
  cursor: disableDrag ? undefined : 'move'
})

export default getDiagramNodeStyle
