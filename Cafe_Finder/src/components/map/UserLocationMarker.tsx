'use client';

import React, { useEffect, useState } from 'react';
import { CircleMarker, useMap } from 'react-leaflet';
import { UserLocation } from '@/lib/types';

interface UserLocationMarkerProps {
  location: UserLocation;
}

export default function UserLocationMarker({ location }: UserLocationMarkerProps) {
  const map = useMap();
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    // Fly to user location when first available
    map.flyTo([location.lat, location.lng], 14, { duration: 1.2 });
    const timer = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(timer);
  }, [location.lat, location.lng, map]);

  // Accuracy circle radius in meters, capped sensibly
  const accuracyRadius = Math.min(location.accuracy, 500);

  return (
    <>
      {/* Accuracy ring */}
      <CircleMarker
        center={[location.lat, location.lng]}
        radius={Math.max(accuracyRadius / 20, 14)}
        pathOptions={{
          color: '#0EA5E9',
          fillColor: '#0EA5E9',
          fillOpacity: 0.08,
          weight: 1.5,
          opacity: 0.4,
          dashArray: '4 4',
        }}
      />
      {/* Outer pulse ring */}
      <CircleMarker
        center={[location.lat, location.lng]}
        radius={18}
        pathOptions={{
          color: '#0284C7',
          fillColor: '#0EA5E9',
          fillOpacity: pulse ? 0.2 : 0.08,
          weight: 2,
          opacity: pulse ? 0.8 : 0.4,
        }}
      />
      {/* Inner solid dot */}
      <CircleMarker
        center={[location.lat, location.lng]}
        radius={7}
        pathOptions={{
          color: '#FFFFFF',
          fillColor: '#0284C7',
          fillOpacity: 1,
          weight: 2.5,
        }}
      />
    </>
  );
}
