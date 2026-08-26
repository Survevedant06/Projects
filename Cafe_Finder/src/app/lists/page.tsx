'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ListTree, Sparkles, Users, ArrowRight, Coffee } from 'lucide-react';
import { CuratedListType } from '@/lib/types';

export default function ListsPage() {
  const [lists, setLists] = useState<CuratedListType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lists')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLists(d.lists);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="relative bg-nomad-navy-900 border border-nomad-navy-800 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-dune-lg">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-nomad-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-0 w-64 h-64 bg-nomad-sienna-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nomad-teal-500/10 border border-nomad-teal-500/25 text-nomad-teal-400 text-xs font-bold">
            <ListTree className="w-3.5 h-3.5" />
            Curated Collections
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-nomad-sand-50 tracking-tight">
            Curated <span className="text-nomad-teal-400">Workspace</span> Lists
          </h1>
          <p className="text-nomad-sand-300 text-sm leading-relaxed">
            Hand-picked itineraries from prolific nomads, founders, and developers sharing their favorite work-ready spots worldwide.
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-nomad-navy-900 animate-pulse border border-nomad-navy-800"
            />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-20 bg-nomad-navy-900 border border-nomad-navy-800 rounded-3xl space-y-3 shadow-dune">
          <Coffee className="w-12 h-12 text-nomad-muted-dark mx-auto" />
          <p className="text-nomad-sand-300 text-sm">No collections yet. Be the first to curate one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => {
            let tags: string[] = [];
            try {
              tags = JSON.parse(list.tags as string);
            } catch {}

            return (
              <Link
                href={`/lists/${list.slug}`}
                key={list.id}
                className="group bg-nomad-navy-900 border border-nomad-navy-800 rounded-2xl overflow-hidden hover:border-nomad-teal-500/50 hover:shadow-dune-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {list.coverImage && (
                    <div className="h-44 overflow-hidden relative bg-nomad-navy-950">
                      <img
                        src={list.coverImage}
                        alt={list.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-nomad-navy-950/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag) => (
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
                  <div className="p-5 space-y-2.5">
                    <h3 className="font-serif font-bold text-base text-nomad-sand-50 line-clamp-2 group-hover:text-nomad-teal-300 transition-colors leading-snug">
                      {list.title}
                    </h3>
                    <p className="text-xs text-nomad-muted-dark line-clamp-2 leading-relaxed">
                      {list.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-4 pt-2 border-t border-nomad-navy-800/80 flex items-center justify-between text-xs text-nomad-muted-dark">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-nomad-teal-400" />
                    {list.authorName}
                  </span>
                  <span className="flex items-center gap-1 text-nomad-teal-400 font-bold group-hover:gap-1.5 transition-all">
                    Explore List <ArrowRight className="w-3 h-3" />
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
