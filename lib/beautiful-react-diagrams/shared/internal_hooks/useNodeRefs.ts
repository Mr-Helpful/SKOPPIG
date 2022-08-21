import { useContext } from 'react'
import DiagramContext from '../../Context/DiagramContext'

/**
 * Returns the node references from the DiagramContext
 */
const useNodeRefs = () => useContext(DiagramContext).nodes

export default useNodeRefs
