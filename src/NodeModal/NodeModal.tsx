/**
Adapted from: 【css】Neumorphism_animation by ma_suwa
@see {@link https://codepen.io/ma_suwa/pens/showcase}
*/
import { CSSTransition } from 'react-transition-group'
import { isHotkeyPressed } from 'react-hotkeys-hook'
import { RiCloseFill } from 'react-icons/ri'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Schema,
  Diagram,
  useSchema,
  createSchema
} from '../../lib/beautiful-react-diagrams'
import DiagramMenu from '../DiagramMenu/DiagramMenu'
import NodeStash from '../NodeStash/NodeStash'
import CustomNode from './CustomElems'

import styles from './NodeModal.module.scss'

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

interface NodeModalProps {
  elem?: HTMLElement
  close?: () => void
}

export const NodeModal = ({
  elem = null,
  close = () => {}
}: NodeModalProps) => {
  /** Modals */
  const rect = useRef({})
  const setRect = useCallback(elem => {
    if (elem !== null) {
      const bbox = elem.getBoundingClientRect()
      rect.current = {
        top: bbox.top,
        left: bbox.left,
        right: `calc(100% - ${bbox.right}px)`,
        bottom: `calc(100% - ${bbox.bottom}px)`
      }
    }
  }, [])

  const [show, setShow] = useState(false)
  useEffect(() => {
    setRect(elem)
    setShow(elem !== null)
    return () => setRect(elem)
  }, [elem, setRect])

  /** Diagrams */
  const startSchema = createSchema({})
  const [schema, { onChange, addNode, connect }] = useSchema(startSchema)
  const display = useRef(() => {})

  const nId = useRef(0)
  const pId = useRef(0)
  const addOne = useCallback(
    () =>
      addNode({
        id: `node-${nId.current++}`,
        content: (
          <div>
            Node <div />
            content
          </div>
        ),
        coordinates: [125, 250],
        selected: false,
        inputs: new Array(2).fill(0).map(() => ({
          id: `port-${pId.current++}`,
          alignment: 'bottom'
        })),
        outputs: new Array(1).fill(0).map(() => ({
          id: `port-${pId.current++}`,
          alignment: 'top'
        })),
        render: CustomNode,
        data: {}
      }),
    [addNode]
  )

  const linkRandom = useCallback(() => {
    const links = unlinked(schema)
    if (links.length === 0) return
    const link = links[Math.floor(Math.random() * links.length)]
    connect(link.input, link.output)
  }, [schema, connect])

  // whether to select multiple nodes at once
  const multiSelect = isHotkeyPressed('shift')
  const onNodeSelect = useCallback(
    (id?: string) => {
      if (onChange) {
        const nodes = schema.nodes.map(node => {
          if (node.id === id) return { ...node, selected: !node.selected }
          else if (multiSelect) return node
          else return { ...node, selected: false }
        })
        onChange({ nodes })
      }
    },
    [schema, onChange, multiSelect]
  )

  const nodeRef = useRef<HTMLDivElement>(null)
  return (
    <CSSTransition
      in={show}
      nodeRef={nodeRef}
      classNames={styles}
      timeout={parseFloat(styles.duration) * 1.5e3}
    >
      <div ref={nodeRef} className={styles.nodeModal} style={rect.current}>
        <RiCloseFill className={styles.closeButton} onClick={close} />
        <DiagramMenu schema={schema} onChange={onChange} />
        <NodeStash />
        <div onClick={addOne}>Add a node!</div>
        <div onClick={display.current}>Show the refs!</div>
        <div onClick={linkRandom}>Link something!</div>
        <Diagram
          schema={schema}
          onChange={onChange}
          displayRef={display}
          className={styles.background}
          onNodeClick={(_, { id }) => onNodeSelect(id)}
          onCanvasClick={() => onNodeSelect(undefined)}
        />
      </div>
    </CSSTransition>
  )
}
