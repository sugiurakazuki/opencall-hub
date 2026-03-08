'use client';

import { useState, useEffect } from 'react';

interface Grant {
  id: number;
  title: string;
  category: string;
  deadline: string;
  is_saved?: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

export default function Home() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Hardcoded user_id 1 for MVP
  const USER_ID = 1;

  async function fetchGrants() {
    try {
      const response = await fetch(`${API_BASE_URL}/grants?user_id=${USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setGrants(data);
      }
    } catch (error) {
      console.error('Failed to fetch grants:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGrants();
  }, []);

  const toggleSave = async (grantId: number, isSaved: boolean) => {
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const url = isSaved 
        ? `${API_BASE_URL}/users/${USER_ID}/saved-grants/${grantId}`
        : `${API_BASE_URL}/users/saved-grants`;
      
      const body = isSaved ? null : JSON.stringify({ user_id: USER_ID, grant_id: grantId });
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (response.ok) {
        fetchGrants(); // Refresh
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  const filteredGrants = grants.filter(grant => 
    grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grant.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderDeadline = (deadline: string) => {
    const daysLeft = getDaysRemaining(deadline);
    if (daysLeft < 0) {
      return `${deadline} (Deadline passed)`;
    } else if (daysLeft === 0) {
      return `${deadline} (Ends today!)`;
    } else {
      return `${deadline} (${daysLeft} days left)`;
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Art Grants & Competitions</h1>
        <a href='/dashboard'>My Saved Grants</a>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <input
          type='text'
          placeholder='Search grants...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', width: '300px' }}
        />
      </div>

      {loading ? (
        <p>Loading grants...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredGrants.map(grant => (
            <div key={grant.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px', position: 'relative' }}>
              <h2>{grant.title}</h2>
              <p><strong>Category:</strong> {grant.category}</p>
              <p><strong>Deadline:</strong> {renderDeadline(grant.deadline)}</p>
              <button 
                onClick={() => toggleSave(grant.id, !!grant.is_saved)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: grant.is_saved ? '#ff4d4f' : '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {grant.is_saved ? 'Unsave' : 'Save'}
              </button>
            </div>
          ))}
          {filteredGrants.length === 0 && <p>No grants found.</p>}
        </div>
      )}
    </div>
  );
}
