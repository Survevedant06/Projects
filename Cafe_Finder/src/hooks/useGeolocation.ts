'use client';

import { useState, useCallback } from 'react';
import { UserLocation } from '@/lib/types';

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

interface UseGeolocationReturn {
  location: UserLocation | null;
  status: GeolocationStatus;
  error: string | null;
  requestLocation: () => void;
  clearLocation: () => void;
}

const SESSION_KEY = 'nomadspot_user_location';

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState<GeolocationStatus>(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY)
      ? 'granted'
      : 'idle'
  );

  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined') {
      setStatus('unavailable');
      return;
    }

    if (!navigator.geolocation) {
      setStatus('unavailable');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setLocation(loc);
        setStatus('granted');
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(loc));
        } catch {}
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError(
            'Location access was denied. Please enable it in your browser settings and try again.'
          );
        } else if (err.code === err.TIMEOUT) {
          setStatus('error');
          setError('Location request timed out. Please try again.');
        } else {
          setStatus('error');
          setError('Unable to determine your location. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // accept cached position up to 1 minute old
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus('idle');
    setError(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  }, []);

  return { location, status, error, requestLocation, clearLocation };
}
