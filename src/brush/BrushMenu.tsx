import React, { useState } from 'react'
import CircularSlider from '@fseehawer/react-circular-slider'
import { RgbColorPicker as ColorPick } from 'react-colorful'
import { HStack, VStack } from '@chakra-ui/react'

interface RGB {
  r: number
  g: number
  b: number
}

interface MenuProps {
  angle?: number
  color?: RGB
  onChange: (layout: { angle: number; color: RGB }) => void
}

export const BrushMenu = ({
  angle = 0,
  color = { r: 0, g: 0, b: 0 },
  onChange = (layout: { angle: number; color: RGB }): void => {}
}: MenuProps) => {
  const [state, setState] = useState({ angle, color })

  function strRGB(rgb: RGB) {
    return `r:${rgb.r},g:${rgb.g},b:${rgb.b}`
  }

  return (
    <div>
      <HStack>
        <VStack>
          <CircularSlider
            dataIndex={state.angle}
            onChange={angle => {
              onChange({ angle, color: state.color })
              setState({ angle, color: state.color })
            }}
          />
          <text>{state.angle}</text>
        </VStack>
        <VStack>
          <ColorPick
            color={state.color}
            onChange={color => {
              onChange({ angle: state.angle, color })
              setState({ angle: state.angle, color })
            }}
          />
          <text>{strRGB(state.color)}</text>
          <text>{`{${strRGB(state.color)},a:${state.angle}}`}</text>
        </VStack>
      </HStack>
    </div>
  )
}
