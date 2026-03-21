import { Alert } from 'antd'

type PageValidationProps = {
  errors?: string[]
}

function PageValidation({ errors = [] }: PageValidationProps) {
  return (
    <div style={{ padding: 24 }}>
      <Alert
        type="warning"
        showIcon
        message="Validation errors"
        description={
          errors.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((error, index) => (
                <li key={`${error}-${index}`}>{error}</li>
              ))}
            </ul>
          ) : (
            'Please review the form fields.'
          )
        }
      />
    </div>
  )
}

export default PageValidation
