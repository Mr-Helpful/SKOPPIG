import { useCallback, useRef } from 'react'
import {
  Diagram,
  useSchema,
  createSchema
} from '../../lib/beautiful-react-diagrams'
import { Schema } from '../../lib/beautiful-react-diagrams/shared/Types'
import { CustomNode } from './CustomElems'
import styles from './CustomElems.module.scss'

const unlinked = (schema: Schema): { input: string; output: string }[] => {
  const inputs: string[] = schema.nodes
    .map(node => (node.inputs ?? []).map(({ id }) => id))
    .flat()
  const outputs: string[] = schema.nodes
    .map(node => (node.outputs ?? []).map(({ id }) => id))
    .flat()
  const links = inputs
    .map(input => outputs.map(output => ({ input, output })))
    .flat()
  return links.filter(({ input, output }) =>
    schema.links.every(
      link =>
        (link.input !== input || link.output !== output) &&
        (link.input !== output || link.output !== input)
    )
  )
}

export const BrushDiagram = initialSchema => {
  const startSchema = createSchema(initialSchema)
  const [schema, { onChange, addNode, connect }] = useSchema(startSchema)
  const { current: display } = useRef({ show: () => {} })

  const nId = useRef(0)
  const pId = useRef(0)
  const addOne = useCallback(() => {
    addNode({
      id: `node-${nId.current++}`,
      content: (
        <div>
          Node <div />
          content
        </div>
      ),
      coordinates: [125, 250],
      inputs: [
        {
          id: `port-${pId.current++}`,
          alignment: 'bottom',
          className: styles.circlePort
        },
        {
          id: `port-${pId.current++}`,
          alignment: 'bottom',
          className: styles.circlePort
        }
      ],
      outputs: [
        {
          id: `port-${pId.current++}`,
          alignment: 'top',
          className: styles.circlePort
        }
      ],
      render: CustomNode,
      data: {}
    })
  }, [addNode])

  const linkRandom = useCallback(() => {
    const links = unlinked(schema)
    if (links.length === 0) {
      // console.log('No links in the diagram left!')
      return
    }
    const link = links[Math.floor(Math.random() * links.length)]
    connect(link.input, link.output)
  }, [schema, connect])

  return (
    <div style={{ width: '100%', height: '22.5rem' }}>
      <Diagram schema={schema} onChange={onChange} config={{ display }} />
      <div onClick={addOne}>Add a node!</div>{' '}
      <div onClick={display.show}>Show the refs!</div>{' '}
      <div onClick={linkRandom}>Link something!</div>
    </div>
  )
}
