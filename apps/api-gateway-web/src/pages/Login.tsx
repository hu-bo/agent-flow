import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, Form, Input, Button, Alert, Typography, message } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { adminInit, fetchApiKeys } from '../api/client';

const { Paragraph } = Typography;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initResult, setInitResult] = useState<{ api_key: string } | null>(null);

  const handleKeyLogin = async (values: { apiKey: string }) => {
    setLoading(true);
    try {
      // Temporarily store key to test it
      localStorage.setItem('af_gw_api_key', values.apiKey);
      await fetchApiKeys();
      login(values.apiKey);
      navigate('/');
    } catch {
      localStorage.removeItem('af_gw_api_key');
      message.error('Invalid API key');
    } finally {
      setLoading(false);
    }
  };

  const handleInit = async (values: { email: string; name: string }) => {
    setLoading(true);
    try {
      const res = await adminInit(values);
      setInitResult(res);
      login(res.api_key, true);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Init failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 420 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>API Gateway Console</h2>

        {initResult && (
          <Alert
            type="success"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            message="Admin initialized"
            description={
              <>
                <Paragraph copyable={{ text: initResult.api_key }} style={{ marginBottom: 0 }}>
                  API Key: <code>{initResult.api_key}</code>
                </Paragraph>
                <Paragraph type="warning" style={{ marginBottom: 0 }}>
                  Save this key now. It will not be shown again.
                </Paragraph>
              </>
            }
            afterClose={() => navigate('/')}
          />
        )}

        <Tabs
          items={[
            {
              key: 'key',
              label: 'Enter API Key',
              children: (
                <Form onFinish={handleKeyLogin} layout="vertical">
                  <Form.Item name="apiKey" label="API Key" rules={[{ required: true }]}>
                    <Input.Password placeholder="sk-af-..." />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    Login
                  </Button>
                </Form>
              ),
            },
            {
              key: 'init',
              label: 'Initialize Admin',
              children: (
                <Form onFinish={handleInit} layout="vertical">
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                    <Input placeholder="admin@example.com" />
                  </Form.Item>
                  <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input placeholder="Admin" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    Initialize
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
