import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Provider, CreateProviderRequest, UpdateProviderRequest } from '../api/client';
import { fetchProviders, createProvider, updateProvider, deleteProvider } from '../api/client';

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'custom', label: 'Custom' },
];

export function Providers() {
  const [data, setData] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchProviders());
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Provider) => {
    setEditing(record);
    form.setFieldsValue({ provider_id: record.provider_id, display_name: record.display_name, base_url: record.base_url, api_key: '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateProvider(editing.id, values as UpdateProviderRequest);
        message.success('Updated');
      } else {
        await createProvider(values as CreateProviderRequest);
        message.success('Created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProvider(id);
      message.success('Deleted');
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Providers</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Provider</Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={false}
        columns={[
          { title: 'Provider', dataIndex: 'provider_id' },
          { title: 'Display Name', dataIndex: 'display_name' },
          { title: 'Base URL', dataIndex: 'base_url', ellipsis: true },
          { title: 'Active', dataIndex: 'is_active', render: (v: boolean) => v ? 'Yes' : 'No' },
          { title: 'Created', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleDateString() },
          {
            title: 'Actions',
            render: (_, record: Provider) => (
              <Space>
                <a onClick={() => openEdit(record)}>Edit</a>
                <Popconfirm title="Delete this provider?" onConfirm={() => handleDelete(record.id)}>
                  <a style={{ color: '#ff4d4f' }}>Delete</a>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? 'Edit Provider' : 'Add Provider'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="provider_id" label="Provider" rules={[{ required: true }]}>
            <Select options={PROVIDER_OPTIONS} disabled={!!editing} placeholder="Select provider" />
          </Form.Item>
          <Form.Item name="display_name" label="Display Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="api_key" label="API Key" rules={editing ? [] : [{ required: true }]}
            extra={editing ? 'Leave empty to keep current key' : undefined}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="base_url" label="Base URL">
            <Input placeholder="Leave empty for default" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
