/**
Adapted from: 【css】Neumorphism_animation by ma_suwa
@see {@link https://codepen.io/ma_suwa/pens/showcase}
*/
import { CSSTransition } from 'react-transition-group'
import { RiCloseFill } from 'react-icons/ri'
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import styles from './Modal.module.scss'

interface NodeModalProps {
  elem?: HTMLElement
  close?: () => void
  children?: ReactNode[]
}

export const ModalBackground = ({ children }) => (
  <div className={styles.background}>{children}</div>
)

const Modal = ({
  elem = null,
  close = () => {},
  children = []
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
      timeout={parseFloat(styles.duration) * 1.5e3}
    >
      <div ref={nodeRef} className={styles.nodeModal} style={rect.current}>
        <RiCloseFill className={styles.closeButton} onClick={close} />
        {children}
      </div>
    </CSSTransition>
  )
}

export default React.memo(Modal)
