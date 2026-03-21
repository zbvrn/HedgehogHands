import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../context/AuthContext'
import './LoginPage.css'

type FieldErrors = Record<string, string[]>

type FormValues = {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

const ROLE_REDIRECTS: Record<Role, string> = {
  Parent: '/tickets',
  Helper: '/queue/new',
  Admin: '/admin/categories',
}

function normalizeErrors(errors?: FieldErrors) {
  if (!errors) return {}
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key.toLowerCase(), value]),
  )
}

function RegisterPage() {
  const { register, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<FormValues>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(ROLE_REDIRECTS[role], { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleChange = (field: keyof FormValues, value: string) => {
    const errorKey = field.toLowerCase()
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[errorKey]
        return next
      })
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    if (formValues.password !== formValues.confirmPassword) {
      setFieldErrors({
        confirmpassword: ['РџР°СЂРѕР»Рё РЅРµ СЃРѕРІРїР°РґР°СЋС‚'],
      })
      return
    }

    setIsSubmitting(true)

    try {
      await register(formValues.displayName, formValues.email, formValues.password)
    } catch (err) {
      if (err instanceof ApiError) {
        const normalized = normalizeErrors(err.fieldErrors)
        setFieldErrors(normalized)
        if (Object.keys(normalized).length === 0) {
          setFormError(err.message)
        } else {
          setFormError('Проверьте поля формы.')
        }
      } else {
        setFormError('Ошибка сети. Попробуйте еще раз.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayNameError = fieldErrors.displayname?.[0]
  const emailError = fieldErrors.email?.[0]
  const passwordError = fieldErrors.password?.[0]
  const confirmPasswordError = fieldErrors.confirmpassword?.[0]

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <div className="login-card__logo-image" aria-hidden="true">
            <span>Р›РѕРіРѕ</span>
          </div>
        </div>

        <div className="login-card__heading">
          <h1>Р•Р¶РѕРІС‹Рµ СЂСѓРєРё</h1>
        </div>

        <div className="login-card__subtitle">Р РµРіРёСЃС‚СЂР°С†РёСЏ</div>

        {formError && <div className="login-error">{formError}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <input
              type="text"
              value={formValues.displayName}
              onChange={(event) => handleChange('displayName', event.target.value)}
              placeholder="Р’РІРµРґРёС‚Рµ РёРјСЏ"
              className={
                displayNameError ? 'login-input login-input--error' : 'login-input'
              }
            />
            {displayNameError && (
              <span className="login-field__error">{displayNameError}</span>
            )}
          </label>
          <label className="login-field">
            <input
              type="email"
              value={formValues.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="Р’РІРµРґРёС‚Рµ email"
              className={emailError ? 'login-input login-input--error' : 'login-input'}
            />
            {emailError && <span className="login-field__error">{emailError}</span>}
          </label>
          <label className="login-field">
            <input
              type="password"
              value={formValues.password}
              onChange={(event) => handleChange('password', event.target.value)}
              placeholder="Р’РІРµРґРёС‚Рµ РїР°СЂРѕР»СЊ"
              className={
                passwordError ? 'login-input login-input--error' : 'login-input'
              }
            />
            {passwordError && <span className="login-field__error">{passwordError}</span>}
          </label>
          <label className="login-field">
            <input
              type="password"
              value={formValues.confirmPassword}
              onChange={(event) => handleChange('confirmPassword', event.target.value)}
              placeholder="РџРѕРґС‚РІРµСЂРґРёС‚Рµ РїР°СЂРѕР»СЊ"
              className={
                confirmPasswordError ? 'login-input login-input--error' : 'login-input'
              }
            />
            {confirmPasswordError && (
              <span className="login-field__error">{confirmPasswordError}</span>
            )}
          </label>
          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Р РµРіРёСЃС‚СЂР°С†РёСЏ...' : 'Р—Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ'}
          </button>
        </form>

        <Link to="/login" className="login-register">
          РЈР¶Рµ РµСЃС‚СЊ Р°РєРєР°СѓРЅС‚? Р’РѕР№С‚Рё
        </Link>
      </div>
    </div>
  )
}

export default RegisterPage

