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
    const onRender = (ev: RenderEvent) => {
      if (ev.img === undefined) setFailed(true)
      else if (ref.current !== null) {
        const ctx = ref.current.getContext('2d')
        ctx.putImageData(ev.img, 0, 0)
        setFailed(false)
      }
    }

    renderer.addEventListener('render', onRender)
    renderer.render('gpu')
    return () => {
      renderer.addEventListener('render', onRender)
    }
  }, [ref, renderer, setFailed])

  const [width, height] = renderer.dimensions
  return (
    <div title={renderer.constructor.name}>
      <RiImage2Line
        style={{ width, height, display: failed ? 'block' : 'none' }}
      />
      <canvas
        ref={ref}
        width={width}
        height={height}
        style={{ display: failed ? 'none' : 'block' }}
      />
    </div>
  )
}

export default React.memo(NodeContent)
