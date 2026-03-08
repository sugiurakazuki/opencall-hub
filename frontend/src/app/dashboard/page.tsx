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

  useEffect(() => {
    async function fetchSavedGrants() {
      try {
        // Hardcoded user_id 1 for MVP
        const response = await fetch('http://localhost:8080/api/users/1/saved-grants');
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
    fetchSavedGrants();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Your Saved Grants</h1>
      
      {loading ? (
        <p>Loading saved grants...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {savedGrants.map(grant => (
            <div key={grant.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
              <h2>{grant.title}</h2>
              <p><strong>Category:</strong> {grant.category}</p>
              <p><strong>Deadline:</strong> {grant.deadline}</p>
            </div>
          ))}
          {savedGrants.length === 0 && <p>You haven't saved any grants yet.</p>}
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/">Back to all grants</a>
      </div>
    </div>
  );
}
