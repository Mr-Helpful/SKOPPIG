import DiagramMethods from './diagram-methods'
import { createContext, useContext, useEffect, useRef } from 'react'
import { DiagramConfig } from '../Diagram'
import { usePortRefs } from '../../Context/DiagramContext'
import { useNodeRefs } from '../../Context/DiagramContext'

import { Schema, Segment } from '../../shared/Types'

interface MethodContextValue {
  schema: Schema
  config: DiagramConfig
  onChange?: (schema: Partial<Schema>) => void
  setSegment: (segment: Segment) => void
}

const MethodContext = createContext<MethodContextValue | undefined>(undefined)

export const useDiagramMethods = () => {
  const { current: methods } = useRef<DiagramMethods>(new DiagramMethods())
  const contextValue = useContext(MethodContext)
  if (contextValue === undefined) {
    throw new Error('useDiagramMethods must be used within a MethodProvider')
  }

  const { schema, config, onChange, setSegment } = contextValue
  const portRefs = usePortRefs()
  const nodeRefs = useNodeRefs()

  useEffect(() => {
    methods.schema = schema
  }, [methods, schema])
  useEffect(() => {
    methods.config = config
  }, [methods, config])
  useEffect(() => {
    methods.onChange = onChange
  }, [methods, onChange])
  useEffect(() => {
    methods.setSegment = setSegment
  }, [methods, setSegment])
  useEffect(() => {
    methods.portRefs = portRefs
  }, [methods, portRefs])
  useEffect(() => {
    methods.nodeRefs = nodeRefs
  }, [methods, nodeRefs])

  return methods
}

const MethodProvider = MethodContext.Provider

export default MethodProvider
