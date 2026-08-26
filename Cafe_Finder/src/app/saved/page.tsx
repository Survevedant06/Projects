'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ListTree, Star, MapPin, Wifi, ArrowRight, Sparkles, Navigation } from 'lucide-react';
import { CafeItem, CuratedListType } from '@/lib/types';
import { formatPlugDensity } from '@/lib/utils';

export default function SavedPage() {
  const [bookmarks, setBookmarks] = useState<CafeItem[]>([]);
  const [lists, setLists] = useState<CuratedListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'lists'>('bookmarks');

  useEffect(() => {
    Promise.all([
      fetch('/api/bookmarks').then((r) => r.json()),
      fetch('/api/lists').then((r) => r.json()),
    ])
      .then(([bd, ld]) => {
        if (bd.success) {
          // Normalize bookmarks array in case elements contain cafe directly or wrapped in .cafe
          const raw = bd.bookmarks || [];
          const normalized = raw.map((item: any) => item.cafe || item);
          setBookmarks(normalized);
        }
        if (ld.success) {
          setLists(ld.lists || []);
        }
      })
      .catch((err) => console.error('Error fetching saved data:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner in Nomad Indigo & Sand */}
      <div className="relative bg-nomad-navy-900 border border-nomad-navy-800 rounded-3xl p-8 sm:p-10 overflow-hidden shadow-dune-lg">
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-nomad-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-0 w-64 h-64 bg-nomad-sienna-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nomad-teal-500/10 border border-nomad-teal-500/25 text-nomad-teal-400 text-xs font-bold">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            My NomadSpot Sanctuary
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-nomad-sand-50 tracking-tight">
            Saved <span className="text-nomad-teal-400">Workspaces</span> & Lists
          </h1>
          <p className="text-nomad-sand-300 text-sm leading-relaxed">
            Your personal collection of bookmarked productive cafes and curated work-ready itineraries.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-nomad-navy-900 border border-nomad-navy-800 rounded-2xl w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-nomad-teal-600 text-white shadow-teal-glow'
              : 'text-nomad-sand-300 hover:text-white hover:bg-nomad-navy-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'fill-current' : ''}`} />
          Bookmarked Workspaces
          {bookmarks.length > 0 && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'bookmarks'
                  ? 'bg-nomad-navy-950 text-nomad-teal-300 border border-nomad-teal-500/30'
                  : 'bg-nomad-navy-800 text-nomad-sand-200'
              }`}
            >
              {bookmarks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('lists')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'lists'
              ? 'bg-nomad-teal-600 text-white shadow-teal-glow'
              : 'text-nomad-sand-300 hover:text-white hover:bg-nomad-navy-800'
          }`}
        >
          <ListTree className="w-4 h-4" />
          Curated Lists
          {lists.length > 0 && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'lists'
                  ? 'bg-nomad-navy-950 text-nomad-teal-300 border border-nomad-teal-500/30'
                  : 'bg-nomad-navy-800 text-nomad-sand-200'
              }`}
            >
              {lists.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-nomad-navy-900 animate-pulse border border-nomad-navy-800"
            />
          ))}
        </div>
      ) : activeTab === 'bookmarks' ? (
        bookmarks.length === 0 ? (
          <div className="py-20 text-center bg-nomad-navy-900 border border-nomad-navy-800 rounded-3xl space-y-4 shadow-dune">
            <Bookmark className="w-12 h-12 text-nomad-muted-dark mx-auto" />
            <h3 className="font-serif font-bold text-nomad-sand-50 text-base">No bookmarks yet</h3>
            <p className="text-xs text-nomad-sand-300 max-w-xs mx-auto">
              Browse the directory, discover work-friendly cafes, and bookmark your favorites.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-nomad-teal-600 text-white rounded-xl text-sm font-bold hover:bg-nomad-teal-500 shadow-teal-glow transition-colors"
            >
              Explore Workspaces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map((cafe) => {
              const ratingDisplay =
                typeof cafe.averageRating === 'number' && cafe.averageRating > 0
                  ? cafe.averageRating.toFixed(1)
                  : 'New';

              return (
                <Link
                  key={cafe.id || cafe.slug}
                  href={`/cafes/${cafe.slug}`}
                  className="group bg-nomad-navy-900 border border-nomad-navy-800 rounded-2xl overflow-hidden hover:border-nomad-teal-500/50 transition-all duration-300 hover:shadow-dune-lg flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative bg-nomad-navy-950 flex-shrink-0">
                    <img
                      src={cafe.coverImage || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80'}
                      alt={cafe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-nomad-navy-950/90 via-nomad-navy-950/20 to-transparent" />
                    
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-nomad-sienna-600 text-white shadow-sienna-glow">
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-nomad-navy-950/90 text-nomad-teal-400 px-2 py-0.5 rounded-full font-bold text-xs border border-nomad-teal-500/30">
                      <Star className="w-3 h-3 fill-current text-nomad-teal-400" />
                      {ratingDisplay}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-nomad-sand-50 group-hover:text-nomad-teal-300 transition-colors line-clamp-1">
                        {cafe.name}
                      </h3>
                      <p className="text-[11px] text-nomad-muted-dark flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-nomad-teal-400 flex-shrink-0" />
                        <span className="truncate">{cafe.neighborhood || cafe.city}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-nomad-navy-800 flex items-center justify-between text-xs">
                      {cafe.wifiSpeedMbps > 0 ? (
                        <div className="flex items-center gap-1.5 font-bold text-nomad-teal-400">
                          <Wifi className="w-3 h-3" />
                          <span>{cafe.wifiSpeedMbps} Mbps</span>
                        </div>
                      ) : (
                        <span className="text-nomad-muted-dark">Wi-Fi available</span>
                      )}
                      <span className="text-nomad-sand-300 font-medium text-[11px]">
                        {formatPlugDensity(cafe.powerPlugDensity || 'MODERATE').label.replace(' Outlets', '')}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-nomad-muted-dark">
              {lists.length} collection{lists.length !== 1 ? 's' : ''}
            </p>
            <Link
              href="/lists"
              className="flex items-center gap-1.5 text-xs font-bold text-nomad-teal-400 hover:text-nomad-teal-300"
            >
              Browse All Lists <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lists.length === 0 ? (
            <div className="py-20 text-center bg-nomad-navy-900 border border-nomad-navy-800 rounded-3xl space-y-4 shadow-dune">
              <ListTree className="w-12 h-12 text-nomad-muted-dark mx-auto" />
              <h3 className="font-serif font-bold text-nomad-sand-50 text-base">No lists yet</h3>
              <p className="text-xs text-nomad-sand-300 max-w-xs mx-auto">
                Create and explore curated lists to organize your favourite workspaces.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {lists.map((list) => {
                let tags: string[] = [];
                try {
                  tags = JSON.parse(list.tags as string);
                } catch {}

                return (
                  <Link
                    key={list.id}
                    href={`/lists/${list.slug}`}
                    className="group bg-nomad-navy-900 border border-nomad-navy-800 rounded-2xl overflow-hidden hover:border-nomad-teal-500/50 transition-all duration-300 hover:shadow-dune-lg flex flex-col"
                  >
                    {list.coverImage && (
                      <div className="h-40 overflow-hidden relative bg-nomad-navy-950 flex-shrink-0">
                        <img
                          src={list.coverImage}
                          alt={list.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-nomad-navy-950/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                          {tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-nomad-teal-600 text-white shadow-teal-glow"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-sm text-nomad-sand-50 group-hover:text-nomad-teal-300 transition-colors line-clamp-1">
                          {list.title}
                        </h3>
                        <p className="text-[11px] text-nomad-muted-dark line-clamp-2 mt-1 leading-relaxed">
                          {list.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-nomad-navy-800 flex items-center justify-between text-xs text-nomad-muted-dark">
                        <span>By {list.authorName || 'Curator'}</span>
                        <span className="text-nomad-teal-400 font-bold">View List →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
