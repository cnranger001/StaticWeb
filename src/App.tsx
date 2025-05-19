import React, { useEffect, useState } from 'react';
import { Layout, Typography, Tabs, Button, Row, Col, Image, Spin } from 'antd';
import { createClient } from '@supabase/supabase-js';
import { useCandidateStore } from './store';
import './index.scss';

const { Title, Text } = Typography;

// Store voting_code as a global variable
let globalVotingCode = '';

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
   // getIP().then(setIp);
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
    //const ip = await getIP();
    const { data } = await supabase.from('votes').select('*').eq('ip', globalVotingCode);
    
    setVoteStatus(data !== null && data.length > 0);
  };

  // const getIP = async () => {
  //   const res = await fetch('https://api.ipify.org?format=json');
  //   const json = await res.json();
  //   return json.ip;
  // };

  const getBrowser = () => {
    return navigator.userAgent;
  };

  const handleVote = async (candidate_id: number, voting_code: string) => {
    globalVotingCode = voting_code;
    const browser = getBrowser();
    
    if (!voting_code) {
      alert('Please enter your voting code.');
      return;
    }

    // Check if voting_code exists in voters table (md5_hash column)
    const { data: voter, error: voterError } = await supabase
      .from('voters')
      .select('*')
      .eq('md5_hash', voting_code)
      .single();

    if (voterError || !voter) {
      alert('Invalid voting code. Please check your code and try again.');
      return;
    }

    const voter_name = voter.name;

    // Check if voting_code already used in votes table (ip column)
    const { data: existingVote, error: voteError } = await supabase
      .from('votes')
      .select('*')
      .eq('ip', voter_name)
      .maybeSingle();

     if (voteError) {
       console.log(voteError)
       alert(voteError.message);
       return;
     }

    if (existingVote) {
      alert( voting_code + ' has already been used.');
      return;
    }

    await supabase.from('votes').insert([{ candidate_id, ip: voter_name, browser }]);
    await fetchVoteStatus();
    await updateVoteCounts();

    alert('Hello ' + voter_name + ', thanks for the vote!');
  };

  return (
    <Layout className="app-layout">
      <div className="banner">
        <Title>Welcome to the Voting App</Title>
        <Text>Your Voting Code:           
           <div style={{ marginBottom: 16 }}>
                    <input
                      id = "voting-code"
                      type="text"
                      placeholder="Enter your voting code"
                      style={{ width: '50%', padding: 2, fontSize: 16 }}
                    />
                    </div>          
           <br/> Browser Info: {getBrowser()}</Text>
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
                    onClick={() => {
                      const code = (document.getElementById('voting-code') as HTMLInputElement | null)?.value || '';
                      handleVote(c.id, code);
                    }}
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
