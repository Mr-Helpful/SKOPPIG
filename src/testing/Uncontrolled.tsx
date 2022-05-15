import { cloneElement } from 'react'
import { Diagram, useSchema, createSchema } from '../dagRender'
import { HStack, Spacer } from '@chakra-ui/react'

function CustomNode({ inputs, outputs, ...rest }) {
  return (
    <div style={{ background: '#717EC3', borderRadius: '10px' }} {...rest}>
      <div style={{ padding: '10px', color: 'white' }}>
        Custom Node
      </div>
      <HStack>
        <div
          style={{ marginTop: '20px' }}
        >
          {inputs.map((port) => cloneElement(port, {
            style: {
              width: '50px', height: '25px', background: '#00AA00'
            }
          }))}
        </div>
        <Spacer />
        <div
          style={{ marginTop: '20px' }}
        >
          {outputs.map((port) => cloneElement(port, {
            style: {
              width: '50px', height: '25px', background: '#AA0000'
            }
          }))}
        </div>
      </HStack>
    </div>
  )
}

export function UncontrolledDiagram(props) {
  const startSchema = createSchema({
    nodes: [
      {
        id: 'node-1',
        content: 'Start',
        coordinates: [100, 150],
        inputs: [
          { id: 'port-0', alignment: 'left' },
          { id: 'port-1', alignment: 'left' },
        ],
        outputs: [
          { id: 'port-2', alignment: 'right' },
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
      { input: 'port-2', output: 'port-3' },
    ]
  })

  const [schema, { onChange }] = useSchema(startSchema)
  return <div style={{ width: '100%', height: '22.5rem' }}>
    <Diagram schema={schema} onChange={onChange} />
  </div>
}