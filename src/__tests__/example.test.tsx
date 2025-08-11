import React from 'react'
import { render, screen } from '@testing-library/react'

function Hello() {
  return <h1>Hello, World!</h1>
}

test('renders hello world', () => {
  render(<Hello />)
  expect(screen.getByText(/hello, world!/i)).toBeInTheDocument()
})
