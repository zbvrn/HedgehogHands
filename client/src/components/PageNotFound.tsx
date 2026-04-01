import { Result } from 'antd'
import './PageNotFound.css'

function PageNotFound() {
  return (
    <div className="page-not-found">
      <Result status="404" title="404" subTitle="Страница не найдена" />
    </div>
  )
}

export default PageNotFound
