'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wifi,
  Zap,
  Volume2,
  Bookmark,
  MapPin,
  Star,
  Plus,
  CheckCircle2,
  Navigation,
  Users,
} from 'lucide-react';
import { CafeItem } from '@/lib/types';
import { formatPlugDensity, formatWifiSpeed } from '@/lib/utils';
import { formatDistance } from '@/lib/providers/geo-utils';

interface CafeCardProps {
  cafe: CafeItem;
  isSelected?: boolean;
  onHover?: (cafe: CafeItem | null) => void;
  onOpenAddToList?: (cafe: CafeItem) => void;
}

export default function CafeCard({
  cafe,
  isSelected,
  onHover,
  onOpenAddToList,
}: CafeCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const wifiInfo = formatWifiSpeed(cafe.wifiSpeedMbps);
  const plugInfo = formatPlugDensity(cafe.powerPlugDensity);
  const isCommunity = cafe.source === 'USER_SUBMITTED' || cafe.status === 'COMMUNITY_ADDED';

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarking(true);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cafeId: cafe.id }),
      });
      const data = await res.json();
      if (data.success) {
        setBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <div
      onMouseEnter={() => onHover && onHover(cafe)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group relative bg-nomad-navy-900 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
        isSelected
          ? 'border-nomad-teal-500 ring-2 ring-nomad-teal-500/20 shadow-dune-lg'
          : 'border-nomad-navy-800 hover:border-nomad-teal-500/50 shadow-dune hover:shadow-dune-lg'
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-nomad-navy-950 flex-shrink-0">
        <img
          src={cafe.coverImage}
          alt={cafe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nomad-navy-950/90 via-nomad-navy-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {cafe.isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-nomad-teal-600 text-white shadow-teal-glow">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          ) : isCommunity ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-nomad-navy-950/90 text-nomad-sand-100 border border-nomad-teal-500/40 backdrop-blur-md">
              <Users className="w-3 h-3 text-nomad-teal-400" /> Community
            </span>
          ) : null}

          {cafe.distanceKm !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-nomad-navy-950/90 text-nomad-teal-400 border border-nomad-navy-700 backdrop-blur-md">
              <Navigation className="w-2.5 h-2.5" />
              {formatDistance(cafe.distanceKm)}
            </span>
          )}
        </div>

        {/* Action Buttons Top Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={toggleBookmark}
            disabled={bookmarking}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
              bookmarked
                ? 'bg-nomad-sienna-600 text-white shadow-sienna-glow'
                : 'bg-nomad-navy-950/80 text-nomad-sand-200 hover:text-white border border-nomad-navy-700'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>

          {onOpenAddToList && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenAddToList(cafe);
              }}
              className="p-2 rounded-full bg-nomad-navy-950/80 text-nomad-sand-200 hover:text-white border border-nomad-navy-700 backdrop-blur-md transition-all"
              title="Add to List"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Rating and Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif font-bold text-base text-nomad-sand-50 line-clamp-1 drop-shadow-md group-hover:text-nomad-teal-300 transition-colors">
              {cafe.name}
            </h3>
            <div className="flex items-center gap-1 bg-nomad-navy-950/90 text-nomad-teal-400 font-black text-xs px-2 py-0.5 rounded-full border border-nomad-teal-500/30 flex-shrink-0">
              <Star className="w-3 h-3 fill-current text-nomad-teal-400" />
              {cafe.averageRating > 0 ? cafe.averageRating.toFixed(1) : 'New'}
            </div>
          </div>
          <p className="text-[11px] text-nomad-sand-300 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-nomad-teal-400 flex-shrink-0" />
            <span className="truncate">{cafe.neighborhood ? `${cafe.neighborhood}, ` : ''}{cafe.city}</span>
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        {/* Telemetry row */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-nomad-teal-500/10 text-nomad-teal-400 border border-nomad-teal-500/20 font-bold">
            <Wifi className="w-3.5 h-3.5" />
            {wifiInfo.label}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-nomad-navy-800 text-nomad-sand-200 border border-nomad-navy-700 font-medium">
            <Zap className="w-3.5 h-3.5 text-nomad-sienna-500" />
            {plugInfo.label.replace(' Outlets', '')}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-nomad-navy-800 text-nomad-muted-dark border border-nomad-navy-700 font-medium">
            <Volume2 className="w-3.5 h-3.5" />
            {cafe.noiseLevel}
          </span>
        </div>

        {/* Tagline / Snippet */}
        {cafe.tagline && (
          <p className="text-xs text-nomad-muted-dark line-clamp-2 leading-relaxed">
            {cafe.tagline}
          </p>
        )}

        {/* Footer Link */}
        <div className="pt-2.5 border-t border-nomad-navy-800 flex items-center justify-between">
          <span className="text-[11px] text-nomad-muted-dark truncate max-w-[170px]">
            {cafe.address}
          </span>
          <Link
            href={`/cafes/${cafe.slug}`}
            className="px-3 py-1.5 rounded-xl bg-nomad-teal-600/15 hover:bg-nomad-teal-600 text-nomad-teal-400 hover:text-white border border-nomad-teal-500/30 text-xs font-bold transition-all duration-200"
          >
            Explore →
          </Link>
        </div>
      </div>
    </div>
  );
}
