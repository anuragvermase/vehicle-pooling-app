import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// This fixes the marker icons (don't worry about understanding this part)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FreeMap = ({ rides = [], selectedRide = null }) => {
  // Map will start showing New York City
  const center = [40.7128, -74.0060];

  const mapStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '16px'
  };

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={mapStyle}
      scrollWheelZoom={true}
    >
      {/* This loads the actual map tiles (the map images) */}
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* This will show markers for rides when you have location data */}
      {rides.map((ride, index) => (
        ride.coordinates ? (
          <Marker key={index} position={[ride.coordinates.lat, ride.coordinates.lng]}>
            <Popup>
              <div>
                <strong>{ride.from} → {ride.to}</strong><br/>
                Driver: {ride.driver}<br/>
                Price: {ride.price}
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
};

export default FreeMap;