import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Badge, Spin } from 'antd';
import { fetchHealth, fetchProviders, fetchApiKeys, fetchLogs } from '../api/client';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<string>('unknown');
  const [providerCount, setProviderCount] = useState(0);
  const [keyCount, setKeyCount] = useState(0);
  const [lastLogTime, setLastLogTime] = useState<string>('-');

  useEffect(() => {
    Promise.allSettled([
      fetchHealth().then((r) => setHealth(r.status)),
      fetchProviders().then((r) => setProviderCount(r.length)),
      fetchApiKeys().then((r) => setKeyCount(r.length)),
      fetchLogs({ page: 1, size: 1 }).then((r) => {
        if (r.data.length > 0) setLastLogTime(new Date(r.data[0].created_at).toLocaleString());
      }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin style={{ display: 'block', marginTop: 100 }} />;

  return (
    <>
      <h2>Dashboard</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Gateway Status"
              valueRender={() => (
                <Badge status={health === 'ok' ? 'success' : 'error'} text={health} />
              )}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Providers" value={providerCount} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="API Keys" value={keyCount} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Last Request" value={lastLogTime} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
