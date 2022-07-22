import { VStack } from "@chakra-ui/react"

const TwoStack = ({ children }) => {
  return <VStack>
    {children}
    {children}
  </VStack>
}

export const BigStack = ({ children, depth = 0 }) => {
  while (depth--) children = <TwoStack>{children}</TwoStack>
  return children
}