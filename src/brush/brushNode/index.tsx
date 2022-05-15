import { HStack } from '@chakra-ui/react'
import BsImage from 'BsImage.svg'

export abstract class BrushNode {
  // should be shared between nodes
  displayed: boolean = false
  dimensions: [number, number] = [0, 0]
  translation: [number, number] = [0, 0]

  // need to be implemented
  abstract noSources: number

  abstract renderCPU(
    sources: CanvasRenderingContext2D[],
    destination: CanvasRenderingContext2D
  ): void

  // renderGPU can be implemented in the future,
  // but is only really required for fast, compiled code
  renderGPU: ((
    sources: CanvasRenderingContext2D[],
    destination: CanvasRenderingContext2D
  ) => void) | undefined = undefined

  // wraps together the render methods
  renderFailure(destination: CanvasRenderingContext2D): void {
    const { width: cw, height: ch } = destination.canvas
    destination.drawImage(BsImage, cw / 2, ch / 2)
  }

  render(
    sources: CanvasRenderingContext2D[],
    destination: CanvasRenderingContext2D,
    mode: "cpu" | "gpu" | string = "cpu"
  ) {
    try {
      switch (mode) {
        case "gpu":
          if (this.renderGPU) {
            this.renderGPU(sources, destination)
            break
          }
        case "cpu":
          if (this.renderCPU) {
            this.renderCPU(sources, destination)
            break
          }
        default:
          throw new Error("render method not implemented")
      }
    } catch (e) {
      console.log(e)
      this.renderFailure(destination)
    }
  }

  menu(props) {
    return <HStack>

    </HStack>
  }
}

export { NoiseNode, PerlinNode } from './randomNode'