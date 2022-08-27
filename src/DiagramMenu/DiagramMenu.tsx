import React, { HTMLAttributes } from 'react'
import { IconContext } from 'react-icons'
import {
  RiDeleteBin2Fill,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiNodeTree,
  RiRestartLine
} from 'react-icons/ri'
import {
  Schema,
  defaultSchema,
  defaultCallback
} from '../../lib/beautiful-react-diagrams/shared/Types'
import { MenuActions } from './menu-actions'

import styles from './DiagramMenu.module.scss'

interface DiagramMenuProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  schema?: Schema
  onChange?: (schema: Partial<Schema>) => void
}

const DiagramMenu = ({
  schema = defaultSchema,
  onChange = defaultCallback,
  className = '',
  ...rest
}: DiagramMenuProps) => {
  const actions = new MenuActions(schema, onChange)
  const classes = styles.diagramMenu + (className && ` ${className}`)

  return (
    <div className={classes} {...rest}>
      <IconContext.Provider value={{ size: '2rem' }}>
        <RiDeleteBin2Fill onClick={() => actions.delete()} />
        <RiArrowUpSLine onClick={() => actions.collapse()} />
        <RiArrowDownSLine onClick={() => actions.expand()} />
        <RiNodeTree onClick={() => actions.children()} />
        <RiRestartLine onClick={() => actions.clear()} />
      </IconContext.Provider>
    </div>
  )
}

export default React.memo(DiagramMenu)
