import { useEffect, useState } from 'react'
import { Alert, Button, Form, Input } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ApiRequestError } from '../../api/http'
import logo from '../../assets/Logo.png'
import './LoginPage.css'

const roleHomeRoutes = {
  parent: '/parent/children',
  helper: '/helper/announcements',
  admin: '/admin/parents',
} as const

function LoginPage() {
  const { login, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [email, setEmail] = useState('parent@example.com')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !role) {
      return
    }
    const target = roleHomeRoutes[role]
    if (target) {
      navigate(target, { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <div className="login-card__logo-image" aria-hidden="true">
            <img src={logo} alt="Ежовые руки" className="login-card__logo-img" />
          </div>
        </div>

        <div className="login-card__heading">
          <h1>Ежовые руки</h1>
        </div>

        <div className="login-card__subtitle">Вход в систему</div>

        <Form
          form={form}
          className="login-form"
          layout="vertical"
          requiredMark={false}
          onFinish={async () => {
            setValidationError(null)
            setServerError(null)
            setIsSubmitting(true)
            try {
              await login(email, password)
            } catch (err) {
              if (err instanceof ApiRequestError && (err.status === 400 || err.status === 401)) {
                setValidationError(err.message)
                form.setFields([{ name: 'email', errors: [err.message] }])
              } else {
                setServerError(err instanceof Error ? err.message : 'Ошибка входа')
              }
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          <Form.Item
            name="email"
            className="login-field"
            rules={[{ required: true, message: 'Введите email' }]}
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Введите email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            className="login-field"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
            />
          </Form.Item>
          {validationError && (
            <Alert
              type="warning"
              showIcon
              message={validationError}
              className="login-alert"
            />
          )}
          {serverError && (
            <Alert
              type="error"
              showIcon
              message={serverError}
              className="login-alert"
            />
          )}
          <Button
            type="primary"
            htmlType="submit"
            className="login-button"
            loading={isSubmitting}
          >
            Войти
          </Button>
        </Form>

        <Link to="/register" className="login-register">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
