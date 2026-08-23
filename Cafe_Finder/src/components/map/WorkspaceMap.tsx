'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { Star, Wifi, Navigation, Users, CheckCircle2 } from 'lucide-react';
import { CafeItem, OsmCafe, UserLocation } from '@/lib/types';
import { formatPlugDensity } from '@/lib/utils';
import { formatDistance } from '@/lib/providers/geo-utils';
import UserLocationMarker from './UserLocationMarker';

// ─── Map Click Listener for Drop-a-Pin ───────────────────────────────────────
function MapClickHandler({
  onMapClick,
  dropPinMode,
}: {
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  dropPinMode?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (dropPinMode && onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// ─── Map Auto-Updater ────────────────────────────────────────────────────────
function MapUpdater({
  cafes,
  osmCafes,
  selectedCafe,
  userLocation,
}: {
  cafes: CafeItem[];
  osmCafes: OsmCafe[];
  selectedCafe: CafeItem | null;
  userLocation: UserLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedCafe) {
      map.flyTo([selectedCafe.lat, selectedCafe.lng], 15, { duration: 0.9 });
      return;
    }
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.2 });
      return;
    }
    const allPoints: [number, number][] = [
      ...cafes.map((c): [number, number] => [c.lat, c.lng]),
      ...osmCafes.map((c): [number, number] => [c.lat, c.lng]),
    ];
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [cafes, osmCafes, selectedCafe, userLocation, map]);

  return null;
}

// ─── Pin Icon Factory (Nomad Indigo & Sand Theme) ───────────────────────────
function createDbIcon(cafe: CafeItem, isSelected: boolean) {
  const isCommunity = cafe.source === 'USER_SUBMITTED' || cafe.status === 'COMMUNITY_ADDED';
  const wifiText = cafe.wifiSpeedMbps > 0 ? `${Math.round(cafe.wifiSpeedMbps)}M` : '☕';

  if (isSelected) {
    const html = `<div style="display:flex;align-items:center;gap:5px;background:#0284C7;color:#FFFFFF;font-weight:800;font-size:11px;padding:5px 11px;border-radius:999px;box-shadow:0 0 20px rgba(14,165,233,0.6),0 4px 12px rgba(0,0,0,0.8);white-space:nowrap;border:2px solid #E0F2FE;">
      <span>☕</span><span>${wifiText}</span>
    </div>`;
    return L.divIcon({ className: 'custom-leaflet-marker', html, iconSize: [76, 28], iconAnchor: [38, 14], popupAnchor: [0, -18] });
  }

  if (isCommunity) {
    const html = `<div style="display:flex;align-items:center;gap:4px;background:#0F172A;color:#38BDF8;font-weight:700;font-size:11px;padding:4px 9px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,0.7);border:1.5px solid #0EA5E9;white-space:nowrap;">
      <span style="color:#38BDF8">👥</span><span>${wifiText}</span>
    </div>`;
    return L.divIcon({ className: 'custom-leaflet-marker', html, iconSize: [72, 26], iconAnchor: [36, 13], popupAnchor: [0, -16] });
  }

  const html = `<div style="display:flex;align-items:center;gap:4px;background:#0F172A;color:#38BDF8;font-weight:700;font-size:11px;padding:4px 9px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,0.7);border:1.5px solid #243247;white-space:nowrap;">
    <span>☕</span><span>${wifiText}</span>
  </div>`;
  return L.divIcon({ className: 'custom-leaflet-marker', html, iconSize: [72, 26], iconAnchor: [36, 13], popupAnchor: [0, -16] });
}

function createOsmIcon(distanceKm: number) {
  const label = formatDistance(distanceKm);
  const html = `<div style="display:flex;align-items:center;gap:3px;background:#1E293B;color:#D9D0C3;font-weight:600;font-size:10px;padding:3px 8px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,0.6);border:1px solid #334155;white-space:nowrap;">
    <span style="color:#0EA5E9">•</span><span>${label}</span>
  </div>`;
  return L.divIcon({ className: 'custom-leaflet-marker', html, iconSize: [64, 22], iconAnchor: [32, 11], popupAnchor: [0, -14] });
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface WorkspaceMapProps {
  cafes: CafeItem[];
  osmCafes?: OsmCafe[];
  selectedCafe: CafeItem | null;
  userLocation?: UserLocation | null;
  dropPinMode?: boolean;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onSelectCafe?: (cafe: CafeItem) => void;
}

export default function WorkspaceMap({
  cafes,
  osmCafes = [],
  selectedCafe,
  userLocation = null,
  dropPinMode = false,
  onMapClick,
  onSelectCafe,
}: WorkspaceMapProps) {
  const defaultCenter: [number, number] =
    userLocation
      ? [userLocation.lat, userLocation.lng]
      : cafes.length > 0
      ? [cafes[0].lat, cafes[0].lng]
      : [20.5937, 78.9629];

  return (
    <div className={`relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-nomad-navy-700 shadow-dune-lg ${dropPinMode ? 'cursor-crosshair' : ''}`}>
      {dropPinMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-full bg-nomad-teal-600 text-white text-xs font-bold shadow-teal-glow flex items-center gap-2 pointer-events-none animate-pulse">
          <span>📍 Click anywhere on the map to add a workspace</span>
        </div>
      )}

      <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom className="w-full h-full">
        {/* CARTO Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler onMapClick={onMapClick} dropPinMode={dropPinMode} />

        <MapUpdater
          cafes={cafes}
          osmCafes={osmCafes}
          selectedCafe={selectedCafe}
          userLocation={userLocation}
        />

        {/* User Location Pulsing Dot */}
        {userLocation && <UserLocationMarker location={userLocation} />}

        {/* DB & Verified Cafe Pins */}
        {cafes.map((cafe) => (
          <Marker
            key={cafe.id}
            position={[cafe.lat, cafe.lng]}
            icon={createDbIcon(cafe, selectedCafe?.id === cafe.id)}
            eventHandlers={{ click: () => onSelectCafe && onSelectCafe(cafe) }}
          >
            <Popup>
              <div className="w-56 p-1">
                <div className="h-28 rounded-lg overflow-hidden relative mb-2.5 bg-nomad-navy-800">
                  <img src={cafe.coverImage} alt={cafe.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-nomad-navy-900/90 text-nomad-teal-400 font-black text-[11px] px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-nomad-teal-500/30">
                    <Star className="w-3 h-3 fill-current text-nomad-teal-400" />
                    {cafe.averageRating > 0 ? cafe.averageRating.toFixed(1) : 'New'}
                  </div>
                  {cafe.isVerified ? (
                    <div className="absolute top-2 left-2 bg-nomad-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-teal-glow">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </div>
                  ) : cafe.source === 'USER_SUBMITTED' || cafe.status === 'COMMUNITY_ADDED' ? (
                    <div className="absolute top-2 left-2 bg-nomad-navy-950/90 text-nomad-sand-100 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-nomad-teal-500/40">
                      <Users className="w-2.5 h-2.5 text-nomad-teal-400" /> Community
                    </div>
                  ) : null}
                  {cafe.distanceKm !== undefined && (
                    <div className="absolute bottom-2 left-2 bg-nomad-navy-950/80 text-nomad-teal-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Navigation className="w-2.5 h-2.5" />
                      {formatDistance(cafe.distanceKm)}
                    </div>
                  )}
                </div>
                <h4 className="font-serif font-bold text-sm leading-snug line-clamp-1 text-nomad-sand-50">{cafe.name}</h4>
                <p className="text-[11px] text-nomad-muted-dark line-clamp-1 mt-0.5">{cafe.neighborhood || cafe.city}</p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-nomad-navy-800 text-[11px]">
                  <span className="font-bold text-nomad-teal-400 flex items-center gap-1">
                    <Wifi className="w-3 h-3" />{cafe.wifiSpeedMbps} Mbps
                  </span>
                  <span className="text-nomad-navy-700">•</span>
                  <span className="text-nomad-sand-300">{formatPlugDensity(cafe.powerPlugDensity).label.replace(' Outlets', '')}</span>
                </div>
                <Link
                  href={`/cafes/${cafe.slug}`}
                  className="mt-2.5 block w-full text-center py-1.5 bg-nomad-teal-600 hover:bg-nomad-teal-500 text-white text-xs font-bold rounded-lg transition-colors shadow-teal-glow"
                >
                  View Workspace →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* OSM Unverified Pins */}
        {osmCafes.map((cafe) => (
          <Marker
            key={cafe.id}
            position={[cafe.lat, cafe.lng]}
            icon={createOsmIcon(cafe.distanceKm)}
          >
            <Popup>
              <div className="w-48 p-1">
                <h4 className="font-serif font-bold text-sm text-nomad-sand-50 line-clamp-1">{cafe.name}</h4>
                <p className="text-[11px] text-nomad-muted-dark mt-0.5 line-clamp-1">{cafe.city}</p>
                <div className="flex items-center gap-1 mt-2 text-[11px] font-bold text-nomad-teal-400">
                  <Navigation className="w-3 h-3" />
                  {formatDistance(cafe.distanceKm)} away
                </div>
                <p className="text-[10px] text-nomad-muted-dark mt-1.5">
                  OSM Community Data · Unverified
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block w-full text-center py-1 bg-nomad-navy-800 border border-nomad-navy-700 hover:border-nomad-teal-500 text-nomad-sand-200 text-[10px] font-bold rounded-lg transition-colors"
                >
                  Get Directions ↗
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
