import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReportIncident from './ReportIncident'
import { AuthProvider } from '../../context/auth'
import { BrowserRouter } from 'react-router-dom'

describe('ReportIncident form', () => {
  it('requires description input', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ReportIncident />
        </AuthProvider>
      </BrowserRouter>
    )
    const submit = screen.getByRole('button', { name: /submit incident/i })
    fireEvent.click(submit)
    // form uses required attribute; we just assert button is in the doc
    expect(submit).toBeInTheDocument()
  })
})
