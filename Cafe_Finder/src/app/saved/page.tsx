'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ListTree, Plus, Star, MapPin, Wifi, Coffee, ArrowRight } from 'lucide-react';
import { CafeItem, CuratedListType } from '@/lib/types';

export default function SavedPage() {
  const [bookmarks, setBookmarks] = useState<CafeItem[]>([]);
  const [lists, setLists] = useState<CuratedListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'lists'>('bookmarks');

  useEffect(() => {
    Promise.all([
      fetch('/api/bookmarks').then(r => r.json()),
      fetch('/api/lists').then(r => r.json()),
    ]).then(([bd, ld]) => {
      if (bd.success) setBookmarks(bd.bookmarks || []);
      if (ld.success) setLists(ld.lists || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="relative bg-[#0F172A] border border-[#243247] rounded-3xl p-8 sm:p-10 overflow-hidden shadow-card">
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-[#0EA5E9]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/25 text-[#0EA5E9] text-xs font-bold">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            My NomadSpot
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Saved <span className="text-[#0EA5E9]">Workspaces</span> & Lists
          </h1>
          <p className="text-[#6B6B6B] text-sm leading-relaxed">Your personal collection of bookmarked cafes and curated work-ready lists.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#0F172A] border border-[#243247] rounded-2xl w-fit">
        <button onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookmarks' ? 'bg-[#0EA5E9] text-black' : 'text-[#6B6B6B] hover:text-white'}`}>
          <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'fill-current' : ''}`} />
          Bookmarked
          {bookmarks.length > 0 && <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-black ${activeTab === 'bookmarks' ? 'bg-black text-[#0EA5E9]' : 'bg-[#243247] text-white'}`}>{bookmarks.length}</span>}
        </button>
        <button onClick={() => setActiveTab('lists')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'lists' ? 'bg-[#0EA5E9] text-black' : 'text-[#6B6B6B] hover:text-white'}`}>
          <ListTree className="w-4 h-4" />
          My Lists
          {lists.length > 0 && <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-black ${activeTab === 'lists' ? 'bg-black text-[#0EA5E9]' : 'bg-[#243247] text-white'}`}>{lists.length}</span>}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(n => <div key={n} className="h-64 rounded-2xl bg-[#0F172A] animate-pulse border border-[#1E293B]" />)}
        </div>
      ) : activeTab === 'bookmarks' ? (
        bookmarks.length === 0 ? (
          <div className="py-20 text-center bg-[#0F172A] border border-[#243247] rounded-3xl space-y-4">
            <Bookmark className="w-12 h-12 text-[#243247] mx-auto" />
            <h3 className="font-bold text-white text-base">No bookmarks yet</h3>
            <p className="text-xs text-[#6B6B6B]">Browse the directory and bookmark your favourite spots.</p>
            <Link href="/" className="inline-block px-5 py-2.5 bg-[#0EA5E9] text-black rounded-xl text-sm font-bold hover:bg-[#38BDF8] transition-colors">
              Explore Workspaces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map(cafe => (
              <Link key={cafe.id} href={`/cafes/${cafe.slug}`}
                className="group bg-[#0F172A] border border-[#243247] rounded-2xl overflow-hidden hover:border-[#0EA5E9]/50 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.8)]">
                <div className="h-44 overflow-hidden relative">
                  <img src={cafe.coverImage} alt={cafe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-[#0EA5E9]">
                    <Bookmark className="w-3.5 h-3.5 text-black fill-current" />
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#0EA5E9] text-black px-2 py-0.5 rounded font-black text-[11px]">
                    <Star className="w-3 h-3 fill-current" />{cafe.averageRating.toFixed(1)}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-white group-hover:text-[#0EA5E9] transition-colors line-clamp-1">{cafe.name}</h3>
                  <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0EA5E9] flex-shrink-0" />
                    {cafe.neighborhood || cafe.city}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <Wifi className="w-3 h-3" />{cafe.wifiSpeedMbps} Mbps verified
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-[#6B6B6B]">{lists.length} collection{lists.length !== 1 ? 's' : ''}</p>
            <Link href="/lists" className="flex items-center gap-1.5 text-xs font-bold text-[#0EA5E9] hover:underline">
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {lists.length === 0 ? (
            <div className="py-20 text-center bg-[#0F172A] border border-[#243247] rounded-3xl space-y-4">
              <ListTree className="w-12 h-12 text-[#243247] mx-auto" />
              <h3 className="font-bold text-white text-base">No lists yet</h3>
              <p className="text-xs text-[#6B6B6B]">Create curated lists to organize your favourite spots.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {lists.map(list => {
                let tags: string[] = [];
                try { tags = JSON.parse(list.tags as string); } catch {}
                return (
                  <Link key={list.id} href={`/lists/${list.slug}`}
                    className="group bg-[#0F172A] border border-[#243247] rounded-2xl overflow-hidden hover:border-[#0EA5E9]/50 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.8)]">
                    {list.coverImage && (
                      <div className="h-40 overflow-hidden relative">
                        <img src={list.coverImage} alt={list.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                          {tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0EA5E9] text-black shadow">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sm text-white group-hover:text-[#0EA5E9] transition-colors line-clamp-1">{list.title}</h3>
                      <p className="text-[11px] text-[#6B6B6B] line-clamp-2">{list.description}</p>
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
