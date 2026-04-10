import { useState } from 'react';
import { Form, Input, InputNumber, Switch, Button, Alert, Typography, Result, message } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { createUser } from '../api/client';

const { Paragraph } = Typography;

export function Users() {
  const { isAdmin } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ api_key: string; email: string } | null>(null);

  if (!isAdmin) {
    return <Result status="403" title="Admin Only" subTitle="You need admin privileges to access this page." />;
  }

  const handleSubmit = async (values: { email: string; name: string; rate_limit_rpm: number; is_admin: boolean }) => {
    setLoading(true);
    try {
      const res = await createUser(values);
      setResult({ api_key: res.api_key, email: res.email });
      form.resetFields();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Create User</h2>

      {result && (
        <Alert
          type="success"
          showIcon
          closable
          style={{ marginBottom: 24 }}
          message={`User ${result.email} created`}
          description={
            <>
              <Paragraph copyable={{ text: result.api_key }} style={{ marginBottom: 0 }}>
                API Key: <code>{result.api_key}</code>
              </Paragraph>
              <Paragraph type="warning" style={{ marginBottom: 0 }}>
                Save this key now. It will not be shown again.
              </Paragraph>
            </>
          }
          afterClose={() => setResult(null)}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 480 }}
        initialValues={{ rate_limit_rpm: 60, is_admin: false }}
        onFinish={handleSubmit}
      >
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="user@example.com" />
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="rate_limit_rpm" label="Rate Limit (RPM)">
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="is_admin" label="Admin" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Create User
        </Button>
      </Form>
    </>
  );
}
