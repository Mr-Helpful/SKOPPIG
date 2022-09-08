import { Port } from '../Types'

const ensurePortId = (port: Port) => {
  // eslint-disable-next-line no-param-reassign
  port.id ||= `port-${Math.random().toString(36).slice(2, 9)}`

  return port
}

export default ensurePortId
