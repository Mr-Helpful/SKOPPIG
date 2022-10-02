import { DiagramConfig } from '../Diagram'
import removeLink from '../LinksCanvas/removeLinkFromArray'

import {
  Coords,
  ElementObject,
  Link,
  Node,
  Schema,
  Segment
} from '../../shared/Types'

export default class DiagramMethods {
  public schema: Schema
  public config: DiagramConfig

  public onChange: (schema: Partial<Schema>) => void = () => {}
  public setSegment: (segment: Segment) => void

  public portRefs: ElementObject
  public nodeRefs: ElementObject

  constructor() {
    for (let key in this) {
      if (typeof this[key] === 'function') {
        this[key] = (this[key] as Function).bind(this)
      }
    }
  }

  /** Sets a new array of nodes in the schema
   * @param nodes the new nodes to set within the diagram
   */
  onNodesChange(nodes: Node[]) {
    this?.onChange({ nodes })
  }

  /** Updates the position of a node and any currently selected nodes
   * @param nodeId the node to update coordinates on
   * @param coords the new coordinates to set
   * @param coords0 the new x coordinate
   * @param coords1 the new y coordinate
   */
  onNodePositionUpdate(nodeId: string, [cx, cy]: Coords) {
    if (!this.onChange) return // if we can't change node, there's no point

    let { nodes } = this.schema
    const [sx, sy] = nodes.find(({ id }) => id === nodeId)!.coordinates
    const [dx, dy] = [cx - sx, cy - sy]

    this.onNodesChange(
      nodes.map(({ id, selected, disableDrag, coordinates, ...node }) => {
        if ((id === nodeId || selected) && !disableDrag) {
          coordinates = [coordinates[0] + dx, coordinates[1] + dy]
        }
        return { id, selected, disableDrag, coordinates, ...node }
      })
    )
  }

  /** Once an port's element is added to the diagram, store it's reference
   * @param portId the id of the newly added port
   * @param portEl the new element added to the diagram
   */
  onPortRegister(portId: string, portEl: HTMLElement) {
    if (this.portRefs && !this.portRefs[portId]) this.portRefs[portId] = portEl
  }

  /** Once an node's element is added to the diagram, store it's reference
   * @param nodeId the id of the newly added node
   * @param nodeEl the new element added to the diagram
   */
  onNodeRegister(nodeId: string, nodeEl: HTMLElement) {
    if (this.nodeRefs && !this.nodeRefs[nodeId]) this.nodeRefs[nodeId] = nodeEl
  }

  /** Completely removes all elements associated with a node from the diagram
   * @param nodeId the node to remove's id
   * @param inputsPorts all input ports into this node
   * @param outputsPorts all output ports from this node
   */
  onNodeRemove(nodeId: string, inputsPorts: string[], outputsPorts: string[]) {
    delete this.nodeRefs[nodeId]
    inputsPorts.forEach(input => delete this.portRefs[input])
    outputsPorts.forEach(output => delete this.portRefs[output])
  }

  /** When uncompleted link is dragged, update it in the diagram
   * @param portId a unique id for the segment to draw
   * @param from the source coordinates for the segment
   * @param to the destination coordinates for the segment
   * @param alignment how the segment should be aligned at the ends
   */
  onDragNewSegment({ id, ...segment }: Segment) {
    this.setSegment({ id: `segment-${id}`, ...segment })
  }

  /** If a link fails to complete, sets the relevant link to undefined */
  onSegmentFail() {
    this.setSegment(undefined)
  }

  /** Attempt to connect a link between an input and output node/port
   * @param input the id of the input node's port
   * @param output the id of the output node's port
   */
  onSegmentConnect(input: string, output: string) {
    if (this.config?.shouldLink({ input, output }, this.schema)) {
      const links: Link[] = [...(this.schema.links || []), { input, output }]

      this?.onChange({ links })
      this.setSegment(undefined)
      this.config?.onConnect({ input, output })
    } else this.onSegmentFail()
  }

  /** Delete a link from the schema
   * @param link the link to remove from the diagram
   * @param link.input the input id
   * @param link.output the output id
   */
  onLinkDelete({ input, output, readonly }: Link) {
    if (this.schema.links.length > 0 && this.onChange && !readonly) {
      const links = removeLink({ input, output }, this.schema.links)

      this?.onChange({ links })
      this.config?.onDisconnect({ input, output })
    }
  }
}
