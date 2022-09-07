import React, { useEffect, useRef } from 'react'
import { Node } from '../../lib/beautiful-react-diagrams'
import { RenderNode } from './renderNodes'

type NodeContentProps = Omit<Node, 'data'> & {
  data: {
    renderer: RenderNode
    [key: string]: any
  }
}

const NodeContent = ({ data: { renderer } }: NodeContentProps) => {
  const ref = useRef<HTMLCanvasElement>()
  useEffect(() => {
    if (ref.current !== null) {
      const ctx = ref.current.getContext('2d')
      const onRender = data => ctx.putImageData(data, 0, 0)

      renderer.on('render', onRender)
      return () => {
        renderer.off('render', onRender)
      }
    }
  }, [ref, renderer])

  const [width, height] = renderer.dimensions
  return <canvas ref={ref} width={width} height={height} />
}

export default React.memo(NodeContent)
