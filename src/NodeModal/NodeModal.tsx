/**
Adapted from: 【css】Neumorphism_animation by ma_suwa
@see {@link https://codepen.io/ma_suwa/pens/showcase}
*/

import { useCallback, useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import { RiCloseFill } from 'react-icons/ri'

import { BrushDiagram } from '../BrushDiagram/BrushDiagram'
import styles from './NodeModal.module.scss'

interface NodeModalProps {
  elem?: HTMLElement
  close?: () => void
}

export const NodeModal = ({
  elem = null,
  close = () => {}
}: NodeModalProps) => {
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

  const nodeRef = useRef<HTMLDivElement>(null)
  return (
    <CSSTransition
      in={show}
      nodeRef={nodeRef}
      classNames={styles}
      timeout={parseFloat(styles.duration) * 1e3}
    >
      <div ref={nodeRef} className={styles.nodeModal} style={rect.current}>
        <RiCloseFill className={styles.closeButton} onClick={close} />
        <BrushDiagram />
      </div>
    </CSSTransition>
  )
}
