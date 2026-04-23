import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import ParentRequestsPage from '../../pages/parent/RequestsPage'
import NewRequestsPage from '../../pages/helper/NewRequestsPage'
import InProgressRequestsPage from '../../pages/helper/InProgressRequestsPage'
import ResolvedRequestsPage from '../../pages/helper/ResolvedRequestsPage'
import { getRequests } from '../../api/requests'
import { paginated, requestFixture } from '../../test/fixtures'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'

vi.mock('../../api/requests', () => ({
  getRequests: vi.fn(),
  changeRequestStatus: vi.fn(),
  rejectRequest: vi.fn(),
}))

describe('Requests pages', () => {
  beforeEach(() => {
    vi.mocked(getRequests).mockResolvedValue(paginated([requestFixture]))
  })

  it('Parent requests page shows own requests and details link', async () => {
    renderWithProviders(<ParentRequestsPage />, {
      auth: { user: testUsers.parent, role: 'parent', token: 'parent-token' },
    })

    expect(await screen.findByText('Reading support')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reading support' })).toHaveAttribute(
      'href',
      '/requests/1',
    )
    expect(getRequests).toHaveBeenCalledWith(
      'parent-token',
      expect.objectContaining({ page: 1, limit: 10 }),
    )
  })

  it('Helper new queue requests only New items', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/helper/requests/new" element={<NewRequestsPage />} />
      </Routes>,
      {
        initialEntries: ['/helper/requests/new'],
        auth: { user: testUsers.helper, role: 'helper', token: 'helper-token' },
      },
    )

    expect(await screen.findByText('Reading support')).toBeInTheDocument()
    expect(getRequests).toHaveBeenCalledWith(
      'helper-token',
      expect.objectContaining({ status: 'New', onlyMy: true }),
    )
  })

  it('Helper queue pages request InProgress and Resolved statuses', async () => {
    const { unmount } = renderWithProviders(
      <Routes>
        <Route path="/helper/requests/in-progress" element={<InProgressRequestsPage />} />
      </Routes>,
      {
        initialEntries: ['/helper/requests/in-progress'],
        auth: { user: testUsers.helper, role: 'helper', token: 'helper-token' },
      },
    )

    expect(await screen.findByText('Reading support')).toBeInTheDocument()
    expect(getRequests).toHaveBeenLastCalledWith(
      'helper-token',
      expect.objectContaining({ status: 'InProgress', onlyMy: true }),
    )
    unmount()

    renderWithProviders(
      <Routes>
        <Route path="/helper/requests/resolved" element={<ResolvedRequestsPage />} />
      </Routes>,
      {
        initialEntries: ['/helper/requests/resolved'],
        auth: { user: testUsers.helper, role: 'helper', token: 'helper-token' },
      },
    )

    expect(await screen.findByText('Reading support')).toBeInTheDocument()
    expect(getRequests).toHaveBeenLastCalledWith(
      'helper-token',
      expect.objectContaining({ status: 'Resolved', onlyMy: true }),
    )
  })
})
