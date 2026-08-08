import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await apiRequest('/profile');
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>CGPA: {profile.cgpa ?? 'Not set'}</p>
      <p>Grad year: {profile.grad_year ?? 'Not set'}</p>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
}

export default Dashboard;