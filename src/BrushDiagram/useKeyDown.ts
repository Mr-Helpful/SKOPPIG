import { useCallback, useEffect, useState } from 'react'

/** Returns a state variable which represents whether target key is pressed */
const useKeyDown = (target: string): boolean => {
  let [down, setDown] = useState(false)
  const onUp = useCallback<(ev: KeyboardEvent) => void>(
    ({ key }) => key === target && setDown(false),
    [target]
  )
  const onDown = useCallback<(ev: KeyboardEvent) => void>(
    ({ key }) => key === target && setDown(true),
    [target]
  )

  useEffect(() => {
    window.addEventListener('keyup', onUp)
    window.addEventListener('keydown', onDown)
    return () => {
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('keydown', onDown)
    }
  }, [onUp, onDown])
  return down
}

export default useKeyDown
