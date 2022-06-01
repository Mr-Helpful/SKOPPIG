import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState
} from "react";
import { Schema } from '../../shared/Types-ts'
import { SchemaActions } from "./schema-actions";

/*----------------------------------------------------------------
-                      Schema context setup                      -
----------------------------------------------------------------*/
type SchemaContextValue = [Schema, Dispatch<SetStateAction<Schema>>]
const SchemaContext = createContext<SchemaContextValue | undefined>(undefined)

/*----------------------------------------------------------------
-                        Schema providers                        -
----------------------------------------------------------------*/
type ProviderProps = { value: Schema }
export const SchemaProvider = ({
  value = { nodes: [], links: [] }
}: ProviderProps) => {
  return <SchemaContext.Provider value={useState(value)} />
}

/*----------------------------------------------------------------
-                        Schema consumers                        -
----------------------------------------------------------------*/
const useSchemaContextValue = (): SchemaContextValue => {
  const contextValue = useContext(SchemaContext)
  if (contextValue !== undefined) return contextValue
  else throw new Error("Schema Context is unavailable within this element")
}

export const useSchema = () => {
  return useSchemaContextValue()[0]
}

export const useSchemaActions = () => {
  const value = useSchemaContextValue()
  return useMemo(() => new SchemaActions(value[1]), [value])
}