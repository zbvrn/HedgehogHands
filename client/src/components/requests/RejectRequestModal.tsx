import { Form, Input, Modal } from 'antd'
import { useEffect } from 'react'

type Props = {
  open: boolean
  isLoading?: boolean
  onCancel: () => void
  onSubmit: (reason: string) => void
}

function RejectRequestModal({ open, isLoading, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm<{ reason: string }>()

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      open={open}
      title="Отклонить заявку"
      okText="Отклонить"
      okButtonProps={{ danger: true, loading: isLoading }}
      cancelText="Отмена"
      cancelButtonProps={{ disabled: isLoading }}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields()
        onSubmit(values.reason.trim())
      }}
    >
      <Form form={form} layout="vertical" initialValues={{ reason: '' }}>
        <Form.Item
          label="Причина"
          name="reason"
          rules={[
            { required: true, message: 'Укажите причину' },
            { max: 500, message: 'Максимум 500 символов' },
          ]}
        >
          <Input.TextArea
            maxLength={500}
            showCount
            placeholder="Например: нет свободных слотов"
            rows={4}
            autoFocus
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RejectRequestModal

