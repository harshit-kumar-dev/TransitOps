import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon paths in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MAPPLS_SCRIPT_ID = 'mappls-sdk-script';

export default function MapplsMap({ 
  markers = [], // Array of { id, lat, lng, title, subtitle, color }
  route = null, // { sourceLat, sourceLng, destLat, destLng }
  height = '400px' 
}) {
  const mapId = useRef('mappls-map-' + Math.random().toString(36).substring(7));
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');

  // 1. Inject Mappls SDK Script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_MAPPLS_API_KEY;
    if (!apiKey) {
      setError('Mappls API key is missing. Please check your .env configuration.');
      return;
    }

    if (document.getElementById(MAPPLS_SCRIPT_ID)) {
      if (window.mappls) {
        setMapLoaded(true);
      } else {
        const checkInterval = setInterval(() => {
          if (window.mappls) {
            clearInterval(checkInterval);
            setMapLoaded(true);
          }
        }, 100);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = MAPPLS_SCRIPT_ID;
    script.src = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?layer=vector&v=3.0&callback=initMapplsMap`;
    script.async = true;
    script.defer = true;
    
    window.initMapplsMap = () => {
      setMapLoaded(true);
    };

    script.onerror = () => {
      setError('Failed to load Mappls Maps SDK. Please check your network or API Key.');
    };

    document.head.appendChild(script);
  }, []);

  // 2. Initialize Map instance
  useEffect(() => {
    if (mapLoaded && !mapRef.current) {
      try {
        const center = route 
          ? [route.sourceLat, route.sourceLng] 
          : markers.length > 0 
            ? [markers[0].lat, markers[0].lng] 
            : [28.6139, 77.2090]; // Default New Delhi

        mapRef.current = new window.mappls.Map(mapId.current, {
          center: center,
          zoom: 12,
          zoomControl: true,
          location: true,
        });
      } catch (err) {
        console.error("Mappls Initialization Error:", err);
        setError('Error initializing map instance.');
      }
    }
  }, [mapLoaded, markers, route]);

  // 3. Render Markers & Routes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove && m.remove());
    markersRef.current = [];

    let boundsCoords = [];

    // Dispatcher: Add Multiple Markers
    if (markers && markers.length > 0) {
      markers.forEach(m => {
        if (m.lat && m.lng) {
          const marker = new window.mappls.Marker({
            map: mapRef.current,
            position: { lat: m.lat, lng: m.lng },
            popupHtml: `<div style="padding: 4px;"><strong>${m.title}</strong><br/><span style="font-size: 0.8rem">${m.subtitle || ''}</span></div>`,
          });
          markersRef.current.push(marker);
          boundsCoords.push(`${m.lat},${m.lng}`);
        }
      });
    }

    // Driver: Add Route Points
    if (route && route.sourceLat && route.destLat) {
      const srcMarker = new window.mappls.Marker({
        map: mapRef.current,
        position: { lat: route.sourceLat, lng: route.sourceLng },
        popupHtml: `<div style="padding: 4px;"><strong>Source</strong></div>`,
      });
      const destMarker = new window.mappls.Marker({
        map: mapRef.current,
        position: { lat: route.destLat, lng: route.destLng },
        popupHtml: `<div style="padding: 4px;"><strong>Destination</strong></div>`,
      });
      
      markersRef.current.push(srcMarker, destMarker);
      boundsCoords.push(`${route.sourceLat},${route.sourceLng}`);
      boundsCoords.push(`${route.destLat},${route.destLng}`);
    }

  }, [mapLoaded, markers, route]);

  if (error) {
    const center = route 
      ? [route.sourceLat, route.sourceLng] 
      : markers.length > 0 
        ? [markers[0].lat, markers[0].lng] 
        : [28.6139, 77.2090];
        
    return (
      <div style={{ width: '100%', height, position: 'relative' }}>
        {/* Show a subtle banner indicating fallback */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1000, background: '#fef08a', color: '#854d0e', padding: '4px 8px', fontSize: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
          Mappls API Key unauthorized (401). Falling back to OpenStreetMap.
        </div>
        
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 1 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          
          {markers.map(m => (
            m.lat && m.lng && (
              <LeafletMarker key={m.id} position={[m.lat, m.lng]}>
                <LeafletPopup>
                  <strong>{m.title}</strong><br/>
                  <span style={{ fontSize: '0.8rem' }}>{m.subtitle}</span>
                </LeafletPopup>
              </LeafletMarker>
            )
          ))}

          {route && route.sourceLat && (
            <>
              <LeafletMarker position={[route.sourceLat, route.sourceLng]}>
                <LeafletPopup><strong>Source</strong></LeafletPopup>
              </LeafletMarker>
              <LeafletMarker position={[route.destLat, route.destLng]}>
                <LeafletPopup><strong>Destination</strong></LeafletPopup>
              </LeafletMarker>
              <Polyline 
                positions={[
                  [route.sourceLat, route.sourceLng],
                  [route.destLat, route.destLng]
                ]}
                color="blue"
              />
            </>
          )}
        </MapContainer>
      </div>
    );
  }

  return (
    <div 
      id={mapId.current}
      style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0' }} 
    />
  );
}
