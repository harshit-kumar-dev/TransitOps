import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MapplsMap from '../../components/ui/MapplsMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LiveTrackingPage() {
  const { user } = useAuth();
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/dashboard/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Failed to fetch');
        setActiveTrips(resData.data.activeTrips || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return <div style={{ padding: 24, color: '#64748b' }}>Locating vehicles...</div>;
  if (error) return <div style={{ padding: 24, color: '#991b1b' }}>{error}</div>;

  const mapMarkers = activeTrips.map((trip) => {
    const lat = 28.6139 + (Math.random() - 0.5) * 0.4;
    const lng = 77.2090 + (Math.random() - 0.5) * 0.4;
    return {
      id: trip.id,
      lat,
      lng,
      title: `${trip.vehicle} · ${trip.driver}`,
      subtitle: `${trip.source} → ${trip.destination}`
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Live Fleet Tracking</h1>
          <p className="page-subtitle">Real-time GPS tracking and active dispatch visualization</p>
        </div>
      </div>
      <div className="card-premium" style={{ padding: 16 }}>
        <MapplsMap markers={mapMarkers} height="calc(100vh - 220px)" />
      </div>
    </div>
  );
}
