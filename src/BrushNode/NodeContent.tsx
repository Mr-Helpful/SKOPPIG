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
      const cnv = ref.current

      if (ev.img === undefined) setFailed(true)
      else if (cnv !== null) {
        const ctx = cnv.getContext('2d')
        // we always want to overwrite the last image
        ctx.globalCompositeOperation = 'copy'
        ctx.drawImage(ev.img, 0, 0)
        setFailed(false)
      }
    }

    renderer.addEventListener('render', onRender)
    renderer.update()
    return () => {
      renderer.removeEventListener('render', onRender)
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
        style={{ display: failed ? 'none' : 'block', border: '1px solid red' }}
      />
    </div>
  )
}

export default React.memo(NodeContent)
