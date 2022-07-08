import { useContext } from 'react'
import DiagramContext from '../../Context/DiagramContext'

/**
 * Returns the port references from the DiagramContext
 */
const usePortRefs = () => useContext(DiagramContext).ports

export default usePortRefs
