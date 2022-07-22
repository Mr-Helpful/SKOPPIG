import { Coords } from "../../shared/Types"

interface TransitionStyle {
  transform: string
  transition: string
}

export const transitionLink = (
  [sx0, sy0]: Coords, [sx1, sy1]: Coords,
  [ex0, ey0]: Coords, [ex1, ey1]: Coords,
  duration: number
): TransitionStyle => {
  const dx = ex0 - sx0
  const dy = ey0 - sy0
  const sx = (ex1 - ex0) / (sx1 - sx0)
  const sy = (ey1 - ey0) / (sy1 - sy0)

  return {
    transform: `translate(${dx},${dy}) scale(${sx},${sy})`,
    transition: `transform ${duration}s`
  }
}