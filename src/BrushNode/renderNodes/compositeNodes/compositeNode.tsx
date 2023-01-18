import { RenderNode } from '..'
import { Node, Schema } from '../../../../lib/beautiful-react-diagrams'
import {
  optimiseTransforms,
  toTransforms,
  Transform
} from '../../../../lib/skoppig/compiler/evaluationGraph'
import {
  exposedPorts,
  nodeInputIndex,
  rootsIn
} from '../../../../lib/skoppig/schema/schemaMethods'

export abstract class CompositeNode extends RenderNode {
  // we can't know how many sources we have until we construct from a schema
  noSources = undefined

  // a series of transformations that can be performed on a source array to
  // generate the output for the schema the composite node represents
  protected readonly transforms: Transform[]

  constructor(dimensions: [number, number], protected schema: Schema) {
    super(dimensions)
    const unoptimised = toTransforms(schema)
    this.transforms = optimiseTransforms(unoptimised)
  }

  protected async runSchema(
    sources: ImageBitmap[],
    mode: 'cpu' | 'gpu'
  ): Promise<ImageBitmap> {
    let images = sources.concat(
      new Array(this.transforms.length - sources.length)
    )

    for (const [renderer, output, inputs] of this.transforms) {
      images[output] = await renderer.render(
        inputs.map(input => images[input]),
        mode
      )
    }

    const [, lastOut] = this.transforms[this.transforms.length - 1]
    return images[lastOut]
  }
}
