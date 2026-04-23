import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyAnnouncementsPage from '../../pages/helper/MyAnnouncementsPage'
import {
  createAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements,
  updateAnnouncement,
} from '../../api/announcements'
import { getCategories } from '../../api/categories'
import { announcementFixture, categoryFixture, paginated } from '../../test/fixtures'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'

vi.mock('../../api/announcements', () => ({
  getMyAnnouncements: vi.fn(),
  createAnnouncement: vi.fn(),
  updateAnnouncement: vi.fn(),
  deleteAnnouncement: vi.fn(),
}))

vi.mock('../../api/categories', () => ({
  getCategories: vi.fn(),
}))

function renderPage() {
  return renderWithProviders(<MyAnnouncementsPage />, {
    auth: { user: testUsers.helper, role: 'helper', token: 'helper-token' },
  })
}

describe('MyAnnouncementsPage', () => {
  beforeEach(() => {
    vi.mocked(getCategories).mockResolvedValue([categoryFixture])
    vi.mocked(getMyAnnouncements).mockResolvedValue(paginated([announcementFixture]))
    vi.mocked(createAnnouncement).mockResolvedValue(announcementFixture)
    vi.mocked(updateAnnouncement).mockResolvedValue(announcementFixture)
    vi.mocked(deleteAnnouncement).mockResolvedValue({ ok: true })
  })

  it('shows helper announcements list', async () => {
    renderPage()

    expect(await screen.findByText('Reading support')).toBeInTheDocument()
  })

  it('opens create form', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Reading support')
    await user.click(screen.getByTestId('create-announcement'))

    expect(document.querySelector('.ant-modal')).toBeInTheDocument()
  })

  it('opens edit form', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Reading support')
    await user.click(screen.getByTestId('edit-announcement-1'))

    expect(document.querySelector('.ant-modal')).toBeInTheDocument()
  })

  it('deletes announcement after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Reading support')
    await user.click(screen.getByTestId('delete-announcement-1'))
    await user.click(document.querySelector('.ant-modal-confirm .ant-btn-primary')!)

    await waitFor(() => {
      expect(deleteAnnouncement).toHaveBeenCalledWith('helper-token', 1)
    })
  })
})
