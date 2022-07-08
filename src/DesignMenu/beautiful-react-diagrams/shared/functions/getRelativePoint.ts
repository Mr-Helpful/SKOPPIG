const getRelativePoint = (point: [number, number], relative: [number, number]): [number, number] => [point[0] - relative[0], point[1] - relative[1]]

export default getRelativePoint
