import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../contexts/AuthContext';
import { ApiError } from '../api/client';

interface FormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const ROLE_REDIRECTS: Record<Role, string> = {
  Student: '/tickets',
  Operator: '/queue/new',
  Admin: '/admin/categories',
};

export default function RegisterPage() {
  const { register, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(ROLE_REDIRECTS[role], { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (values: FormValues) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await register(values.displayName, values.email, values.password);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>
          Service Desk
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}
        >
          Create a new account
        </Typography.Text>

        {errorMsg && (
          <Alert
            type="error"
            message={errorMsg}
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setErrorMsg(null)}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="Display Name"
            name="displayName"
            rules={[{ required: true, message: 'Please enter your display name' }]}
          >
            <Input placeholder="John Doe" autoComplete="name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="you@example.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Password" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" autoComplete="new-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Register
            </Button>
          </Form.Item>
        </Form>

        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </Typography.Text>
      </Card>
    </div>
  );
}
