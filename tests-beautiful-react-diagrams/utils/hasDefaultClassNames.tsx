import React from 'react'
import { render } from '@testing-library/react'
import { test, expect } from '@playwright/test'

/* eslint-disable no-unused-expressions */
const hasDefaultClassNames = (
  Component,
  defaultProps = {},
  classNames = [],
  elementQuery = null
) => {
  const query = elementQuery || '* > *'

  test('should have default classes', () => {
    const { container } = render(<Component {...defaultProps} />)

    const elNode = container.querySelector(query)

    ;['bi', ...classNames].forEach(className => {
      expect(elNode.classList.contains(className)).to.be.true
    })
  })
}
/* eslint-enable no-unused-expressions */

export default hasDefaultClassNames
