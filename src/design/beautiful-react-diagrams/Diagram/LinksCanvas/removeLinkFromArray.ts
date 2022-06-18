// TODO: Attempt to remove this isequal import (it's suprisingly large)
import isEqual from 'lodash.isequal'
import { Link } from '../../shared/Types-ts'

const removeLinkFromArray = (link: Link, links: Link[]) => links.filter((item) => !isEqual(item, link))

export default removeLinkFromArray
