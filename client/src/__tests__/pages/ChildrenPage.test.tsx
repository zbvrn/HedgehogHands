import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChildrenPage from '../../pages/parent/ChildrenPage'
import { childFixture } from '../../test/fixtures'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'
import { createChild, deleteChild, getChildren, updateChild } from '../../api/children'

vi.mock('../../api/children', () => ({
  getChildren: vi.fn(),
  createChild: vi.fn(),
  updateChild: vi.fn(),
  deleteChild: vi.fn(),
}))

function renderPage() {
  return renderWithProviders(<ChildrenPage />, {
    auth: { user: testUsers.parent, role: 'parent', token: 'parent-token' },
  })
}

describe('ChildrenPage', () => {
  beforeEach(() => {
    vi.mocked(getChildren).mockResolvedValue([childFixture])
    vi.mocked(createChild).mockResolvedValue(childFixture)
    vi.mocked(updateChild).mockResolvedValue(childFixture)
    vi.mocked(deleteChild).mockResolvedValue({ ok: true })
  })

  it('shows children list and add button', async () => {
    renderPage()

    expect(await screen.findByText('Mira')).toBeInTheDocument()
    expect(screen.getByTestId('add-child')).toBeInTheDocument()
  })

  it('opens create form', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Mira')
    await user.click(screen.getByTestId('add-child'))

    expect(document.querySelector('.ant-modal')).toBeInTheDocument()
  })

  it('opens edit form', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Mira')
    await user.click(screen.getByTestId('edit-child-1'))

    expect(document.querySelector('.ant-modal')).toBeInTheDocument()
  })

  it('deletes child after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Mira')
    await user.click(screen.getByTestId('delete-child-1'))
    await user.click(document.querySelector('.ant-modal-confirm .ant-btn-primary')!)

    await waitFor(() => {
      expect(deleteChild).toHaveBeenCalledWith('parent-token', 1)
    })
  })
})
