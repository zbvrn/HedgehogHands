import { Segmented } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

const options = [
  { label: 'Новые', value: '/helper/requests/new' },
  { label: 'В работе', value: '/helper/requests/in-progress' },
  { label: 'Выполненные', value: '/helper/requests/resolved' },
]

function HelperRequestTabs() {
  const navigate = useNavigate()
  const location = useLocation()
  const value = options.some((item) => item.value === location.pathname)
    ? location.pathname
    : options[0].value

  return (
    <Segmented
      className="page-tabs"
      options={options}
      value={value}
      onChange={(nextValue) => navigate(String(nextValue))}
    />
  )
}

export default HelperRequestTabs
