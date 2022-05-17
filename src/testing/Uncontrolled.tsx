import { cloneElement } from 'react'
import { Diagram, useSchema, createSchema } from '../dagRender'
import { HStack, Spacer } from '@chakra-ui/react'
import { CustomNode, CustomPort } from './CustomElems'

let nodeId = 4, portId = 9

export function UncontrolledDiagram(props) {
  const startSchema = createSchema({
    nodes: [
      {
        id: 'node-1',
        content: 'Start',
        coordinates: [125, 250],
        inputs: [
          {
            id: 'port-0', alignment: 'bottom',
            className: 'bi-diagram-port-custom',
            style: { backgroundColor: 'red' }
          },
          {
            id: 'port-1', alignment: 'bottom',
            className: 'bi-diagram-port-custom',
            style: { backgroundColor: 'green' }
          },
        ],
        outputs: [
          {
            id: 'port-2', alignment: 'top',
            className: 'bi-diagram-port-custom',
            style: { backgroundColor: 'blue' }
          },
        ],
        render: CustomNode,
        data: {
          foo: 'bar',
          count: 0,
        }
      },
      {
        id: 'node-2',
        content: 'Middle',
        coordinates: [300, 150],
        inputs: [
          { id: 'port-3', alignment: 'left' },
          { id: 'port-4', alignment: 'bottom' },
        ],
        outputs: [
          { id: 'port-5', alignment: 'right' },
          { id: 'port-6', alignment: 'right' },
        ],
        data: {
          bar: 'foo',
        }
      },
      {
        id: 'node-3',
        content: 'End',
        coordinates: [600, 150],
        inputs: [
          { id: 'port-7', alignment: 'left' },
          { id: 'port-8', alignment: 'left' },
        ],
        data: {
          foo: true,
          bar: false,
          some: {
            deep: {
              object: true,
            }
          },
        }
      },
    ],
    links: [
      {
        input: 'port-2', output: 'port-3',
        // label: 'Initial'
      },
    ]
  })

  const [schema, { onChange, addNode }] = useSchema(startSchema)

  const addOne = () => {
    addNode({
      id: `node-${nodeId++}`,
      content: 'Start',
      coordinates: [125, 250],
      inputs: [
        { id: `port-${portId++}`, alignment: 'bottom', render: CustomPort },
        { id: `port-${portId++}`, alignment: 'bottom', render: CustomPort },
      ],
      outputs: [
        { id: `port-${portId++}`, alignment: 'top', render: CustomPort },
      ],
      render: CustomNode,
    })
  }

  return <div style={{ width: '100%', height: '22.5rem' }}>
    <Diagram schema={schema} onChange={onChange} />
    <button onClick={addOne}>Add a node!</button>
  </div>
}