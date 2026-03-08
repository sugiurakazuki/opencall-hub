'use client';

import { useState, useEffect } from 'react';

interface Grant {
  id: number;
  title: string;
  description: string;
  category: string;
  deadline: string;
}

export default function Home() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrants() {
      try {
        const response = await fetch('http://localhost:8080/api/grants');
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
    fetchGrants();
  }, []);

  const filteredGrants = grants.filter(grant => 
    grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grant.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Art Grants & Competitions</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search grants..."
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
            <div key={grant.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
              <h2>{grant.title}</h2>
              <p><strong>Category:</strong> {grant.category}</p>
              <p><strong>Deadline:</strong> {grant.deadline}</p>
            </div>
          ))}
          {filteredGrants.length === 0 && <p>No grants found.</p>}
        </div>
      )}
    </div>
  );
}
