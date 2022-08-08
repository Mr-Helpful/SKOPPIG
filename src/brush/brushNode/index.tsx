import { HStack } from '@chakra-ui/react'
import BsImage from 'BsImage.svg'

export abstract class BrushNode {
  // should be shared between nodes
  displayed: boolean = false
  dimensions: [number, number] = [0, 0]
  translation: [number, number] = [0, 0]

  // how many sources should be provided for a render
  // needs to be implemented
  abstract noSources: number

  // a fallback rendering method for when gpu rendering
  // is either not possible or not implemented
  // should be implemented
  renderCPU?(
    sources: CanvasRenderingContext2D[],
    destination: CanvasRenderingContext2D
  ): void

  // renderGPU can be implemented in the future,
  // but is only really required for fast, compiled code
  // can be implemented
  renderGPU?(
    sources: CanvasRenderingContext2D[],
    destination: CanvasRenderingContext2D
  ): void

  // wraps together the render methods
  renderFailure(destination: CanvasRenderingContext2D): void {
    const { width: cw, height: ch } = destination.canvas
    destination.drawImage(BsImage, cw / 2, ch / 2)
  }

  render(
    sources: CanvasRenderingContext2D[],
    destination: CanvasRenderingContext2D,
    mode: 'cpu' | 'gpu' | string = 'cpu'
  ) {
    try {
      switch (mode) {
        case 'gpu':
          if (this.renderGPU) {
            this.renderGPU(sources, destination)
            break
          }
        case 'cpu':
          if (this.renderCPU) {
            this.renderCPU(sources, destination)
            break
          }
        default:
          throw new TypeError(`rendering method ${mode} not implemented`)
      }
    } catch (e) {
      console.error(e)
      this.renderFailure(destination)
    }
  }

  menu(props) {
    return (
      <HStack>
        <BsImage />
      </HStack>
    )
  }
}

export * from './randomNode'
export * from './sourceNode'
