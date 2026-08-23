'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { CafeItem, OsmCafe, UserLocation } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const DynamicMap = dynamic(() => import('./WorkspaceMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-nomad-navy-900 rounded-2xl flex flex-col items-center justify-center text-nomad-muted-dark gap-2 border border-nomad-navy-800">
      <Loader2 className="w-6 h-6 animate-spin text-nomad-teal-500" />
      <span className="text-xs font-medium text-nomad-sand-300">Loading Interactive Map…</span>
    </div>
  ),
});

interface MapWrapperProps {
  cafes: CafeItem[];
  osmCafes?: OsmCafe[];
  selectedCafe: CafeItem | null;
  userLocation?: UserLocation | null;
  dropPinMode?: boolean;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onSelectCafe?: (cafe: CafeItem) => void;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <DynamicMap {...props} />;
}
