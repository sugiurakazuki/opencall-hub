'use client';

import { useState, useEffect } from 'react';

interface Grant {
  id: number;
  title: string;
  category: string;
  deadline: string;
}

export default function Dashboard() {
  const [savedGrants, setSavedGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded user_id 1 for MVP
  const USER_ID = 1;

  async function fetchSavedGrants() {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${USER_ID}/saved-grants`);
      if (response.ok) {
        const data = await response.json();
        setSavedGrants(data);
      }
    } catch (error) {
      console.error('Failed to fetch saved grants:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSavedGrants();
  }, []);

  const unsaveGrant = async (grantId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${USER_ID}/saved-grants/${grantId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSavedGrants(); // Refresh
      }
    } catch (error) {
      console.error('Failed to unsave grant:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Your Saved Grants</h1>
        <a href="/">Back to all grants</a>
      </div>
      
      {loading ? (
        <p>Loading saved grants...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {savedGrants.map(grant => (
            <div key={grant.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
              <h2>{grant.title}</h2>
              <p><strong>Category:</strong> {grant.category}</p>
              <p><strong>Deadline:</strong> {grant.deadline}</p>
              <button 
                onClick={() => unsaveGrant(grant.id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Unsave
              </button>
            </div>
          ))}
          {savedGrants.length === 0 && <p>You haven't saved any grants yet.</p>}
        </div>
      )}
    </div>
  );
}
