import React, { useEffect, useRef, useState } from 'react'
import { RiImage2Line } from 'react-icons/ri'
import { RenderEvent, RenderNode } from './renderNodes'

interface NodeContentProps {
  renderer: RenderNode
}

const NodeContent = ({ renderer }: NodeContentProps) => {
  const [failed, setFailed] = useState(true)
  const ref = useRef<HTMLCanvasElement>()
  useEffect(() => {
    if (ref.current !== null) {
      const ctx = ref.current.getContext('2d')
      const onRender = (ev: RenderEvent) => {
        if (ev.img === undefined) setFailed(true)
        else {
          ctx.putImageData(ev.img, 0, 0)
          setFailed(false)
        }
      }

      onRender(new RenderEvent(renderer.img))
      renderer.addEventListener('render', onRender)
      return () => {
        renderer.addEventListener('render', onRender)
      }
    }
  }, [ref, renderer, setFailed])

  const [width, height] = renderer.dimensions
  return failed ? (
    <RiImage2Line width={width} height={height} />
  ) : (
    <canvas ref={ref} width={width} height={height} />
  )
}

export default React.memo(NodeContent)
