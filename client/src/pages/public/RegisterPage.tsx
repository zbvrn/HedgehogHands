import { useEffect, useState } from 'react'
import { Alert, Button, Form, Input } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ApiRequestError } from '../../api/http'
import logo from '../../assets/Logo.png'
import './LoginPage.css'

const roleHomeRoutes = {
  parent: '/parent/children',
  helper: '/helper/ads',
  admin: '/admin/parents',
} as const

function RegisterPage() {
  const { register, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
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

        <div className="login-card__subtitle">Регистрация</div>

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
              await register(email, password, name)
            } catch (err) {
              if (err instanceof ApiRequestError && err.status === 400) {
                setValidationError(err.message)
                form.setFields([{ name: 'email', errors: [err.message] }])
              } else {
                setServerError(err instanceof Error ? err.message : 'Ошибка регистрации')
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
            name="name"
            className="login-field"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Введите имя"
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
          <Form.Item
            name="confirmPassword"
            className="login-field"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Подтвердите пароль' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Пароли не совпадают'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="Подтвердите пароль" />
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
            Зарегистрироваться
          </Button>
        </Form>

        <Link to="/login" className="login-register">
          Уже есть аккаунт? Войти
        </Link>
      </div>
    </div>
  )
}

export default RegisterPage
