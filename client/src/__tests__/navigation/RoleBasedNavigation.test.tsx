import Sidebar from '../../components/Sidebar'
import { renderWithProviders, testUsers } from '../../test/renderWithProviders'

function hrefs(container: HTMLElement) {
  return Array.from(container.querySelectorAll('a')).map((link) =>
    link.getAttribute('href'),
  )
}

describe('Role based navigation', () => {
  it('Parent sees parent navigation only', () => {
    const { container } = renderWithProviders(
      <Sidebar user={testUsers.parent} role="parent" onLogout={vi.fn()} />,
    )

    expect(hrefs(container)).toEqual([
      '/parent/children',
      '/parent/search',
      '/parent/requests',
    ])
    expect(hrefs(container)).not.toContain('/admin/categories')
  })

  it('Helper sees helper navigation only', () => {
    const { container } = renderWithProviders(
      <Sidebar user={testUsers.helper} role="helper" onLogout={vi.fn()} />,
    )

    expect(hrefs(container)).toEqual([
      '/helper/announcements',
      '/helper/requests/new',
      '/helper/requests/in-progress',
      '/helper/requests/resolved',
    ])
    expect(hrefs(container)).not.toContain('/admin/categories')
  })

  it('Admin sees admin navigation only', () => {
    const { container } = renderWithProviders(
      <Sidebar user={testUsers.admin} role="admin" onLogout={vi.fn()} />,
    )

    expect(hrefs(container)).toEqual([
      '/admin/parents',
      '/admin/helpers',
      '/admin/categories',
    ])
    expect(hrefs(container)).not.toContain('/parent/children')
  })
})
