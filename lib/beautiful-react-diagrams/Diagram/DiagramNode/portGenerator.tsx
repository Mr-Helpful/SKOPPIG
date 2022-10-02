import React from 'react'
import DiagramPort from '../Port/DiagramPort'

import { Port } from '../../shared/Types'

const portGenerator = (type: 'input' | 'output') =>
  function PortGen(port: Port) {
    return <DiagramPort {...port} type={type} key={port.id} />
  }

export default portGenerator
