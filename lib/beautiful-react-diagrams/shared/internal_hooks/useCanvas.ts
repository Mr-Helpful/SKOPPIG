import { useContext } from 'react'
import DiagramContext from '../../Context/DiagramContext'

/**
 * Returns the canvas bounding box from the DiagramContext
 */
const useCanvas = () => useContext(DiagramContext).canvas

export default useCanvas
