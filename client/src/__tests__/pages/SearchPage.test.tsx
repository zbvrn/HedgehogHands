import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchPage from '../../pages/parent/SearchPage'
import { getAnnouncements } from '../../api/announcements'
import { getCategories } from '../../api/categories'
import { getChildren } from '../../api/children'
import { createRequest } from '../../api/requests'
import {
  announcementFixture,
  categoryFixture,
  childFixture,
  paginated,
  requestFixture,
} from '../../test/fixtures'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'

vi.mock('../../api/announcements', () => ({
  getAnnouncements: vi.fn(),
}))

vi.mock('../../api/categories', () => ({
  getCategories: vi.fn(),
}))

vi.mock('../../api/children', () => ({
  getChildren: vi.fn(),
}))

vi.mock('../../api/requests', () => ({
  createRequest: vi.fn(),
}))

function renderPage() {
  return renderWithProviders(<SearchPage />, {
    auth: { user: testUsers.parent, role: 'parent', token: 'parent-token' },
  })
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.mocked(getCategories).mockResolvedValue([categoryFixture])
    vi.mocked(getChildren).mockResolvedValue([childFixture])
    vi.mocked(getAnnouncements).mockResolvedValue(
      paginated([
        announcementFixture,
        { ...announcementFixture, id: 2, title: 'Math help' },
      ]),
    )
    vi.mocked(createRequest).mockResolvedValue(requestFixture)
  })

  it('shows announcements list and pagination', async () => {
    const { container } = renderPage()

    expect(await screen.findByText('Reading support')).toBeInTheDocument()
    expect(screen.getByText('Math help')).toBeInTheDocument()
    expect(container.querySelector('.ant-pagination')).toBeInTheDocument()
  })

  it('sends text search to API', async () => {
    const user = userEvent.setup()
    const { container } = renderPage()

    await screen.findByText('Reading support')
    const searchInput = container.querySelector('.ant-input-search input')!
    await user.type(searchInput, 'reading')

    await waitFor(
      () => {
        expect(getAnnouncements).toHaveBeenLastCalledWith(
          'parent-token',
          expect.objectContaining({ search: 'reading' }),
        )
      },
      { timeout: 1000 },
    )
  })

  it('opens response modal from announcement card', async () => {
    const user = userEvent.setup()
    const { container } = renderPage()

    await screen.findByText('Reading support')
    const primaryButtons = container.querySelectorAll('button.ant-btn-primary')
    await user.click(primaryButtons[primaryButtons.length - 1])

    expect(document.querySelector('.ant-modal')).toBeInTheDocument()
  })
})
