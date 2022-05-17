import React from 'react'
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams'

export const BrushTree = ({ }) => {
  const style = { backgroundColor: 'red' }

  const startSchema = createSchema({
    nodes: [
      {
        id: 'node-1',
        content: 'Node 1',
        coordinates: [200, 200],
        inputs: [{ id: 'in-1.1' }],
        outputs: [{ id: 'out-1.1' }]
      },
      {
        id: 'node-2',
        content: 'Node 2',
        coordinates: [200, 200],
        inputs: [{ id: 'in-2.1' }]
      }
    ],
    links: [
      { input: 'out-1.1', output: 'in-2.1' }
    ]
  })

  const [schema, { onChange }] = useSchema(startSchema)
  return <div>
    <Diagram schema={schema} onChange={onChange} />
  </div>
}