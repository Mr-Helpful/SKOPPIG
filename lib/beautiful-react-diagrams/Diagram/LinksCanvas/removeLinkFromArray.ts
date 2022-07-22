import { Link } from '../../shared/Types'

const LinkEq = (link1: Link, link2: Link): boolean => {
  // we can't really check equality on ReactNodes
  if (!('label' in link1 === 'label' in link2)) return false

  return (
    link1.input === link2.input &&
    link1.output === link2.output &&
    link1.readonly === link2.readonly &&
    link1.className === link2.className
  )
}

const removeLink = (link1: Link, links: Link[]) => links.filter(link2 => {
  return !LinkEq(link2, link1)
})

export default removeLink
