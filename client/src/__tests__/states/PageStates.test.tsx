import { screen } from '@testing-library/react'
import PageEmpty from '../../components/PageEmpty'
import PageError from '../../components/PageError'
import PageLoading from '../../components/PageLoading'
import { renderWithProviders } from '../../test/renderWithProviders'

describe('Page states', () => {
  it('renders loading state', () => {
    const { container } = renderWithProviders(<PageLoading />)

    expect(container.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('renders error state', () => {
    renderWithProviders(<PageError message="Load failed" />)

    expect(screen.getByText('Load failed')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    renderWithProviders(<PageEmpty description="No data yet" />)

    expect(screen.getByText('No data yet')).toBeInTheDocument()
  })
})
