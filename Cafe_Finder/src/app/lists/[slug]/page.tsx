'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Wifi, Star, Coffee, Users } from 'lucide-react';
import { CuratedListType, CafeItem } from '@/lib/types';

export default function ListDetailPage() {
  const { slug } = useParams() as { slug: string };
  const [list, setList] = useState<CuratedListType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lists/${slug}`).then(r => r.json()).then(d => {
      if (d.success) setList(d.list);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <div className="w-10 h-10 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!list) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
      <Coffee className="w-10 h-10 text-[#243247] mx-auto" />
      <h2 className="font-bold text-white">List Not Found</h2>
      <Link href="/lists" className="inline-block px-5 py-2.5 bg-[#0EA5E9] text-black rounded-xl text-sm font-bold">← Back to Collections</Link>
    </div>
  );

  let tags: string[] = [];
  try { tags = JSON.parse(list.tags as string); } catch {}

  const cafes: CafeItem[] = list.items?.map((item: any) => item.cafe).filter(Boolean) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/lists" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#0EA5E9] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Collections
      </Link>

      {/* Header */}
      <div className="relative bg-[#0F172A] border border-[#243247] rounded-3xl overflow-hidden">
        {list.coverImage && (
          <div className="h-56 w-full relative">
            <img src={list.coverImage} alt={list.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-black/50 to-transparent" />
          </div>
        )}
        <div className="p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => <span key={t} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0EA5E9] text-black">{t}</span>)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{list.title}</h1>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">{list.description}</p>
          <div className="flex items-center gap-2 text-xs text-[#404040]">
            <Users className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span>Curated by <strong className="text-[#A0A0A0]">{list.authorName}</strong></span>
            <span className="text-[#243247]">•</span>
            <span>{cafes.length} workspace{cafes.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Cafes */}
      {cafes.length === 0 ? (
        <div className="text-center py-12 bg-[#0F172A] border border-[#243247] rounded-2xl">
          <Coffee className="w-10 h-10 text-[#243247] mx-auto mb-2" />
          <p className="text-sm text-[#6B6B6B]">No cafes in this collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cafes.map((cafe, idx) => (
            <Link key={cafe.id} href={`/cafes/${cafe.slug}`}
              className="group bg-[#0F172A] border border-[#243247] rounded-2xl overflow-hidden hover:border-[#0EA5E9]/50 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.8)]">
              <div className="relative h-44 overflow-hidden">
                <img src={cafe.coverImage} alt={cafe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-[#0EA5E9] text-black font-black text-xs flex items-center justify-center shadow">
                  {idx + 1}
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#0EA5E9] text-black px-2 py-0.5 rounded font-black text-[11px]">
                  <Star className="w-3 h-3 fill-current" />
                  {cafe.averageRating.toFixed(1)}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-white group-hover:text-[#0EA5E9] transition-colors line-clamp-1">{cafe.name}</h3>
                <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0EA5E9] flex-shrink-0" />
                  {cafe.neighborhood || cafe.city}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <Wifi className="w-3 h-3" />
                  {cafe.wifiSpeedMbps} Mbps verified
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
