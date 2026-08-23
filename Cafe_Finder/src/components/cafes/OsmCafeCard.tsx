'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Globe, Phone, Clock, Navigation, PlusCircle } from 'lucide-react';
import { OsmCafe } from '@/lib/types';
import { formatDistance } from '@/lib/providers/geo-utils';

interface OsmCafeCardProps {
  cafe: OsmCafe;
}

export default function OsmCafeCard({ cafe }: OsmCafeCardProps) {
  const submitUrl = `/submit?name=${encodeURIComponent(cafe.name)}&address=${encodeURIComponent(cafe.address)}&city=${encodeURIComponent(cafe.city)}&lat=${cafe.lat}&lng=${cafe.lng}`;

  return (
    <div className="group relative bg-nomad-navy-900 rounded-2xl border border-nomad-navy-800 hover:border-nomad-teal-500/40 shadow-dune hover:shadow-dune-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Cover Image */}
      <div className="relative h-44 w-full overflow-hidden flex-shrink-0 bg-nomad-navy-950">
        <img
          src={cafe.coverImage}
          alt={cafe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nomad-navy-950/90 via-nomad-navy-950/40 to-transparent" />

        {/* Distance Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-nomad-navy-950/90 text-nomad-teal-400 border border-nomad-navy-700 backdrop-blur-md shadow-sm">
            <Navigation className="w-3 h-3" />
            {formatDistance(cafe.distanceKm)}
          </span>
        </div>

        {/* OSM Source Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-nomad-navy-950/80 border border-nomad-navy-700 text-nomad-muted-dark backdrop-blur-sm">
            📍 OSM
          </span>
        </div>

        {/* Name at Bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-serif font-bold text-base text-nomad-sand-50 leading-snug line-clamp-1 drop-shadow-md">
            {cafe.name}
          </h3>
          {(cafe.neighborhood || cafe.city) && (
            <div className="flex items-center gap-1 text-[11px] text-nomad-sand-300 mt-0.5">
              <MapPin className="w-3 h-3 text-nomad-teal-400 flex-shrink-0" />
              <span className="truncate">
                {cafe.neighborhood ? `${cafe.neighborhood}, ` : ''}{cafe.city}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col gap-3 justify-between">
        {/* Address */}
        {cafe.address && cafe.address !== 'Address on Map' && (
          <p className="text-xs text-nomad-muted-dark line-clamp-2 leading-relaxed">
            {cafe.address}
          </p>
        )}

        {/* OSM Metadata */}
        <div className="flex flex-wrap gap-2 text-xs">
          {cafe.openingHours && (
            <span className="inline-flex items-center gap-1 text-nomad-sand-300">
              <Clock className="w-3 h-3 text-nomad-teal-400" />
              <span className="truncate max-w-[120px]">{cafe.openingHours}</span>
            </span>
          )}
          {cafe.phone && (
            <span className="inline-flex items-center gap-1 text-nomad-sand-300">
              <Phone className="w-3 h-3 text-nomad-teal-400" />
              <span>{cafe.phone}</span>
            </span>
          )}
          {cafe.website && (
            <a
              href={cafe.website.startsWith('http') ? cafe.website : `https://${cafe.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-nomad-teal-400 hover:underline"
            >
              <Globe className="w-3 h-3" />
              Website
            </a>
          )}
        </div>

        {/* Unverified Notice + CTAs */}
        <div className="mt-auto pt-3 border-t border-nomad-navy-800 space-y-2">
          <p className="text-[10px] text-nomad-muted-dark leading-relaxed">
            Community place via OpenStreetMap. Wi-Fi & outlet telemetry not yet verified.
          </p>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl text-[11px] font-bold text-center bg-nomad-navy-800 border border-nomad-navy-700 text-nomad-sand-200 hover:border-nomad-teal-500/50 hover:text-white transition-all flex items-center justify-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              Directions
            </a>
            <Link
              href={submitUrl}
              className="flex-1 py-2 rounded-xl text-[11px] font-bold text-center bg-nomad-teal-600/15 border border-nomad-teal-500/30 text-nomad-teal-400 hover:bg-nomad-teal-600 hover:text-white transition-all flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-3 h-3" />
              Add Review
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
