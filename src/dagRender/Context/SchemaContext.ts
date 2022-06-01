import { createContext } from 'react';
import { Schema } from '../shared/Types-ts';

export const SchemaContext = createContext<Schema>({ nodes: [], links: [] })