import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../contexts/AuthContext';
import { ApiError } from '../api/client';

interface FormValues {
  email: string;
  password: string;
}

const ROLE_REDIRECTS: Record<Role, string> = {
  Student: '/tickets',
  Operator: '/queue/new',
  Admin: '/admin/categories',
};

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
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
      await login(values.email, values.password);
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
          Sign in to your account
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
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password placeholder="Password" autoComplete="current-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register">Register</Link>
        </Typography.Text>
      </Card>
    </div>
  );
}
