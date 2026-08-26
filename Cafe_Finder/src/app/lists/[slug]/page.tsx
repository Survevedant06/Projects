'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Wifi, Star, Coffee, Users, Sparkles, Quote, Zap } from 'lucide-react';
import { CuratedListType } from '@/lib/types';
import { formatPlugDensity } from '@/lib/utils';

export default function ListDetailPage() {
  const { slug } = useParams() as { slug: string };
  const [list, setList] = useState<CuratedListType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lists/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setList(d.list);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-nomad-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Coffee className="w-10 h-10 text-nomad-navy-700 mx-auto" />
        <h2 className="font-serif font-bold text-white text-xl">List Not Found</h2>
        <Link
          href="/lists"
          className="inline-block px-5 py-2.5 bg-nomad-teal-600 text-white rounded-xl text-sm font-bold shadow-teal-glow hover:bg-nomad-teal-500 transition-colors"
        >
          ← Back to Collections
        </Link>
      </div>
    );
  }

  let tags: string[] = [];
  try {
    tags = JSON.parse(list.tags as string);
  } catch {}

  const items = list.items || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/lists"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-nomad-muted-dark hover:text-nomad-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Collections
      </Link>

      {/* Hero Banner in Nomad Indigo & Sand */}
      <div className="relative bg-nomad-navy-900 border border-nomad-navy-800 rounded-3xl overflow-hidden shadow-dune-lg">
        {list.coverImage && (
          <div className="h-64 w-full relative bg-nomad-navy-950">
            <img src={list.coverImage} alt={list.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-nomad-navy-900 via-nomad-navy-950/60 to-transparent" />
          </div>
        )}
        <div className="p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-nomad-teal-500/15 border border-nomad-teal-500/30 text-nomad-teal-400"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-nomad-sand-50 leading-tight">
            {list.title}
          </h1>
          <p className="text-sm text-nomad-sand-300 leading-relaxed max-w-3xl">{list.description}</p>
          <div className="flex items-center gap-3 text-xs text-nomad-muted-dark pt-2 border-t border-nomad-navy-800">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-nomad-teal-400" />
              <span>
                Curated by <strong className="text-nomad-sand-100">{list.authorName}</strong>
              </span>
            </span>
            <span className="text-nomad-navy-700">•</span>
            <span>
              {items.length} workspace{items.length !== 1 ? 's' : ''} curated
            </span>
          </div>
        </div>
      </div>

      {/* Cafes Grid with Curator Notes */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-nomad-navy-900 border border-nomad-navy-800 rounded-3xl shadow-dune">
          <Coffee className="w-10 h-10 text-nomad-muted-dark mx-auto mb-2" />
          <p className="text-sm text-nomad-muted-dark">No workspaces in this collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item: any, idx: number) => {
            const cafe = item.cafe;
            if (!cafe) return null;

            const ratingDisplay =
              typeof cafe.averageRating === 'number' && cafe.averageRating > 0
                ? cafe.averageRating.toFixed(1)
                : 'New';

            return (
              <Link
                key={cafe.id || idx}
                href={`/cafes/${cafe.slug}`}
                className="group bg-nomad-navy-900 border border-nomad-navy-800 rounded-2xl overflow-hidden hover:border-nomad-teal-500/50 transition-all duration-300 hover:shadow-dune-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-nomad-navy-950">
                    <img
                      src={cafe.coverImage}
                      alt={cafe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-nomad-navy-950/90 via-nomad-navy-950/20 to-transparent" />
                    
                    {/* Position order badge */}
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-nomad-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-teal-glow">
                      {idx + 1}
                    </div>

                    {/* Rating badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-nomad-navy-950/90 text-nomad-teal-400 px-2 py-0.5 rounded-full font-bold text-xs border border-nomad-teal-500/30">
                      <Star className="w-3 h-3 fill-current text-nomad-teal-400" />
                      {ratingDisplay}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-serif font-bold text-base text-nomad-sand-50 group-hover:text-nomad-teal-300 transition-colors line-clamp-1">
                        {cafe.name}
                      </h3>
                      <p className="text-[11px] text-nomad-muted-dark flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-nomad-teal-400 flex-shrink-0" />
                        <span className="truncate">{cafe.neighborhood ? `${cafe.neighborhood}, ` : ''}{cafe.city}</span>
                      </p>
                    </div>

                    {/* Curator's Recommendation Note */}
                    {item.curatorNote && (
                      <div className="p-3 rounded-xl bg-nomad-teal-500/10 border border-nomad-teal-500/20 text-xs text-nomad-teal-300 leading-relaxed flex items-start gap-2">
                        <Quote className="w-4 h-4 text-nomad-teal-400 flex-shrink-0 mt-0.5" />
                        <p className="italic">{item.curatorNote}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Telemetry */}
                <div className="px-5 pb-4 pt-2 border-t border-nomad-navy-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-nomad-teal-400">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{cafe.wifiSpeedMbps} Mbps</span>
                  </div>
                  <span className="text-nomad-sand-300 font-medium">
                    {formatPlugDensity(cafe.powerPlugDensity || 'MODERATE').label.replace(' Outlets', '')}
                  </span>
                  <span className="text-nomad-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    Explore →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
