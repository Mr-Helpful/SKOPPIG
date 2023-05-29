export * from './renderNode'

// import * as CompositeNodes from './compositeNodes'
import * as FilterNodes from './filterNodes'
import * as MergeNodes from './mergeNodes'
import * as RandomNodes from './randomNodes'
import * as SourceNodes from './sourceNodes'

const RenderNodes = Object.values({
  ...FilterNodes,
  ...MergeNodes,
  ...RandomNodes,
  ...SourceNodes
})
export default RenderNodes
