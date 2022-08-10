const getDiagramNodeStyle = (
  coordinates: [number, number],
  disableDrag: boolean
) => ({
  left: coordinates[0],
  top: coordinates[1],
  cursor: disableDrag ? undefined : 'move'
})

export default getDiagramNodeStyle
