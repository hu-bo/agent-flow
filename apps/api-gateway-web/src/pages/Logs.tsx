import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Drawer, Tag, message } from 'antd';
import type { LogEntry, LogDetail } from '../api/client';
import { fetchLogs, fetchLogDetail } from '../api/client';

export function Logs() {
  const [data, setData] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [conversationId, setConversationId] = useState('');
  const [detail, setDetail] = useState<LogDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLogs({ page, size: pageSize, conversation_id: conversationId || undefined });
      setData(res.data);
      // Estimate total from response — if backend returns full page, there might be more
      setTotal(res.data.length < pageSize ? (page - 1) * pageSize + res.data.length : page * pageSize + 1);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, conversationId]);

  useEffect(() => { load(); }, [load]);

  const showDetail = async (id: string) => {
    try {
      const d = await fetchLogDetail(id);
      setDetail(d);
      setDrawerOpen(true);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to load detail');
    }
  };

  const statusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'green';
    if (code >= 400 && code < 500) return 'orange';
    return 'red';
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Request Logs</h2>
        <Input.Search
          placeholder="Filter by conversation ID"
          allowClear
          style={{ width: 300 }}
          onSearch={(v) => { setConversationId(v); setPage(1); }}
        />
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        onRow={(record) => ({ onClick: () => showDetail(record.id), style: { cursor: 'pointer' } })}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: setPage,
          showSizeChanger: false,
        }}
        columns={[
          { title: 'Provider', dataIndex: 'provider_id' },
          { title: 'Model', dataIndex: 'model' },
          {
            title: 'Status',
            dataIndex: 'status_code',
            render: (v: number) => <Tag color={statusColor(v)}>{v}</Tag>,
          },
          { title: 'Duration', dataIndex: 'duration_ms', render: (v: number) => `${v}ms` },
          { title: 'Conversation', dataIndex: 'conversation_id', ellipsis: true },
          { title: 'Time', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
        ]}
      />

      <Drawer
        title="Log Detail"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
      >
        {detail && (
          <>
            <p><strong>Provider:</strong> {detail.provider_id}</p>
            <p><strong>Model:</strong> {detail.model}</p>
            <p><strong>Status:</strong> {detail.status_code}</p>
            <p><strong>Duration:</strong> {detail.duration_ms}ms</p>
            <p><strong>Conversation:</strong> {detail.conversation_id || '-'}</p>
            <p><strong>Time:</strong> {new Date(detail.created_at).toLocaleString()}</p>
            <h4>Request</h4>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', maxHeight: 300 }}>
              {JSON.stringify(detail.request_body, null, 2)}
            </pre>
            <h4>Response</h4>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', maxHeight: 300 }}>
              {JSON.stringify(detail.response_body, null, 2)}
            </pre>
          </>
        )}
      </Drawer>
    </>
  );
}
