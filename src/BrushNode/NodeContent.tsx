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
    console.log(`Content section ${renderer.constructor.name} rendered`)
    const onRender = (ev: RenderEvent) => {
      const cnv = ref.current
      console.log(`Content for ${renderer.constructor.name} updated`)

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
    renderer.render('gpu')
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
