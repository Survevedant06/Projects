'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ListTree, Sparkles, Users, ArrowRight, Coffee } from 'lucide-react';
import { CuratedListType } from '@/lib/types';

export default function ListsPage() {
  const [lists, setLists] = useState<CuratedListType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lists').then(r => r.json()).then(d => {
      if (d.success) setLists(d.lists);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="relative bg-[#0F172A] border border-[#243247] rounded-3xl p-8 sm:p-12 overflow-hidden shadow-card">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#0EA5E9]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/25 text-[#0EA5E9] text-xs font-bold">
            <ListTree className="w-3.5 h-3.5" />
            Community Collections
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Curated <span className="text-[#0EA5E9]">Workspace</span> Collections
          </h1>
          <p className="text-[#6B6B6B] text-sm leading-relaxed">
            Hand-picked lists from prolific nomads, founders, and developers sharing their favorite work-ready spots around the world.
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(n => <div key={n} className="h-64 rounded-2xl bg-[#0F172A] animate-pulse border border-[#1E293B]" />)}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-20 bg-[#0F172A] border border-[#243247] rounded-3xl space-y-3">
          <Coffee className="w-12 h-12 text-[#243247] mx-auto" />
          <p className="text-[#6B6B6B] text-sm">No collections yet. Be the first to curate one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lists.map(list => {
            let tags: string[] = [];
            try { tags = JSON.parse(list.tags as string); } catch {}
            return (
              <Link href={`/lists/${list.slug}`} key={list.id}
                className="group bg-[#0F172A] border border-[#243247] rounded-2xl overflow-hidden hover:border-[#0EA5E9]/50 hover:shadow-[0_8px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(14,165,233,0.1)] transition-all duration-300">
                {list.coverImage && (
                  <div className="h-44 overflow-hidden relative">
                    <img src={list.coverImage} alt={list.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                      {tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0EA5E9] text-black shadow">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-[#0EA5E9] transition-colors leading-snug">{list.title}</h3>
                  <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed">{list.description}</p>
                  <div className="flex items-center justify-between text-xs text-[#404040] pt-2 border-t border-[#1E1E1E]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#0EA5E9]" />
                      {list.authorName}
                    </span>
                    <span className="flex items-center gap-1 text-[#0EA5E9] font-semibold group-hover:gap-2 transition-all">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
