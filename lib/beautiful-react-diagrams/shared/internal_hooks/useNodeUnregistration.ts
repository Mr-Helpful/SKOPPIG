import { useEffect } from 'react'
import getNodePortsId from '../functions/getNodePortsId'
import { Port } from '../Types'

/**
 * Takes the inputs and outputs node ports and onNodeRemove callback to be performed when the node is unmounted
 */
const useNodeUnregistration = (
  onNodeRemove: (id: string, inputs: string[], outputs: string[]) => void,
  inputs: Port[],
  outputs: Port[],
  id: string
) => {
  useEffect(
    () => () => {
      const node = { inputs, outputs }
      const inputsPort = getNodePortsId(node, 'inputs')
      const outputsPort = getNodePortsId(node, 'outputs')
      onNodeRemove(id, inputsPort, outputsPort)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // no dependancies, we only want to run when the component is removed
  )
}

export default useNodeUnregistration
