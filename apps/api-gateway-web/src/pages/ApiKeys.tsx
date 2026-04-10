import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, Alert, Typography, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ApiKey } from '../api/client';
import { fetchApiKeys, createApiKey, deleteApiKey } from '../api/client';

const { Paragraph } = Typography;

export function ApiKeys() {
  const [data, setData] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchApiKeys());
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const { name } = await form.validateFields();
    try {
      const res = await createApiKey(name);
      setNewKey(res.key);
      form.resetFields();
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey(id);
      message.success('Key revoked');
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>API Keys</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setNewKey(null); setModalOpen(true); }}>
          Create Key
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={false}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Key Prefix', dataIndex: 'key_prefix' },
          { title: 'Active', dataIndex: 'is_active', render: (v: boolean) => v ? 'Yes' : 'No' },
          { title: 'Last Used', dataIndex: 'last_used_at', render: (v: string) => v ? new Date(v).toLocaleString() : '-' },
          { title: 'Created', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleDateString() },
          {
            title: 'Actions',
            render: (_, record: ApiKey) => (
              <Popconfirm title="Revoke this key?" onConfirm={() => handleDelete(record.id)}>
                <a style={{ color: '#ff4d4f' }}>Revoke</a>
              </Popconfirm>
            ),
          },
        ]}
      />

      <Modal
        title="Create API Key"
        open={modalOpen}
        onOk={newKey ? () => setModalOpen(false) : handleCreate}
        onCancel={() => setModalOpen(false)}
        okText={newKey ? 'Done' : 'Create'}
        destroyOnClose
      >
        {newKey ? (
          <Alert
            type="success"
            showIcon
            message="Key created"
            description={
              <>
                <Paragraph copyable={{ text: newKey }} style={{ marginBottom: 0 }}>
                  <code>{newKey}</code>
                </Paragraph>
                <Paragraph type="warning" style={{ marginBottom: 0 }}>
                  Save this key now. It will not be shown again.
                </Paragraph>
              </>
            }
          />
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Key Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. production-key" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}
