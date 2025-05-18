import React, { useEffect, useState } from 'react';
import { Layout, Typography, Tabs, Button, Row, Col, Image, Spin } from 'antd';
import { createClient } from '@supabase/supabase-js';
import { useCandidateStore } from './store';
import './index.scss';

const { Title, Text } = Typography;

const supabase = createClient(
  'https://rhbjcqgmeuyyipnstrpm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYmpjcWdtZXV5eWlwbnN0cnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MDg1OTAsImV4cCI6MjA2MDA4NDU5MH0.xR-pVUEbmYVi97mqgUgqabff8cTNEjI1xUblL5Loi50'
);

const App = () => {
  const {
    candidates,
    setCandidates,
    voteStatus,
    setVoteStatus,
    activeKey,
    setActiveKey,
  } = useCandidateStore();

  const [ip, setIp] = useState<string>('');

  useEffect(() => {
    getIP().then(setIp);
    fetchCandidates();
    fetchVoteStatus();
   // const interval = setInterval(() => updateVoteCounts(), 3000);
   // return () => clearInterval(interval);
  }, []);

  const fetchCandidates = async () => {
    const { data, error } = await supabase.from('candidates').select('*');

    if (!error && data) {
      const withVotes = await Promise.all(
        data.map(async (c) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_id', c.id);
          return { ...c, vote_count: count || 0 };
        })
      );
      withVotes.sort((a, b) => b.vote_count - a.vote_count);
      setCandidates(withVotes);
      setActiveKey(withVotes[0]?.id.toString());
    }
  };

  const updateVoteCounts = async () => {
    const updated = await Promise.all(
      candidates.map(async (c) => {
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', c.id);
        return { ...c, vote_count: count || 0 };
      })
    );
    updated.sort((a, b) => b.vote_count - a.vote_count);
    setCandidates(updated);
  };

  const fetchVoteStatus = async () => {
    const ip = await getIP();
    const { data } = await supabase.from('votes').select('*').eq('ip', ip);
    
    setVoteStatus(data !== null && data.length > 0);
  };

  const getIP = async () => {
    const res = await fetch('https://api.ipify.org?format=json');
    const json = await res.json();
    return json.ip;
  };

  const getBrowser = () => {
    return navigator.userAgent;
  };

  const handleVote = async (candidate_id: number) => {
    const ip = await getIP();
    const browser = getBrowser();
    await supabase.from('votes').insert([{ candidate_id, ip, browser }]);
    await fetchVoteStatus();
    await updateVoteCounts();
  };

  return (
    <Layout className="app-layout">
      <div className="banner">
        <Title>Welcome to the Voting App</Title>
        <Text>Your IP: {ip} <br/> Browser Info: {getBrowser()}</Text>
      </div>
      {candidates.length === 0 ? (
        <Spin />
      ) : (
        <Tabs
          tabPosition="left"
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
          items={candidates.map((c, index) => ({
            key: c.id.toString(),
            label: (
              <span>
                 {c.first_name} {c.last_name} ({c.vote_count})
              </span>
            ),
            children: (
              <Row gutter={16}>
                <Col span={12}>
                    {Array.from({ length: 15 }).map((_, i) => {
                    const imageUrl = `https://rhbjcqgmeuyyipnstrpm.supabase.co/storage/v1/object/public/photos//${c.first_name}_${c.last_name}${i + 1}.png`;
                    return (
                      <Image
                      key={i}
                      width={400}
                      src={imageUrl}
                      alt="Screenshot"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    );
                    })}
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    disabled={voteStatus}
                    onClick={() => handleVote(c.id)}
                  >
                    {voteStatus ? 'Voted' : 'Vote'}
                  </Button>
                  <div className="prompt-text">
                    <iframe
                      src={`https://rhbjcqgmeuyyipnstrpm.supabase.co/functions/v1/serve-txt?file=${c.first_name}_${c.last_name}_prompt.txt`}

                      style={{ width: '100%', height: '800px', border: 'none' }}
                      title="prompt"
                    ></iframe>
                  </div>
                </Col>
              </Row>
            ),
          }))}
        />
      )}
    </Layout>
  );
};

export default App;
