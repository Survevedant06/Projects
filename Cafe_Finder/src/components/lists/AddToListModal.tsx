'use client';

import React, { useState, useEffect } from 'react';
import { X, ListPlus, Check, Plus, Lock, Globe } from 'lucide-react';
import { CafeItem, CuratedListType } from '@/lib/types';

interface AddToListModalProps {
  cafe: CafeItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToListModal({ cafe, isOpen, onClose }: AddToListModalProps) {
  const [lists, setLists] = useState<CuratedListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/lists').then(r => r.json()).then(d => {
      if (d.success) setLists(d.lists);
      setLoading(false);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async (listSlug: string) => {
    setAdding(listSlug);
    try {
      const res = await fetch(`/api/lists/${listSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cafeId: cafe.id, note: '' }),
      });
      const d = await res.json();
      if (d.success) setAdded(prev => new Set(Array.from(prev).concat(listSlug)));
    } catch {}
    setAdding(null);
  };

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    setCreating(true);
    try {
      const slug = newListName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newListName, slug, description: '', isPublic: true, authorName: 'You', tags: [] }),
      });
      const d = await res.json();
      if (d.success) {
        setLists([d.list, ...lists]);
        setNewListName('');
        setShowCreate(false);
      }
    } catch {}
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-[#243247] rounded-3xl max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#243247]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center">
              <ListPlus className="w-4 h-4 text-[#0EA5E9]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Add to List</h3>
              <p className="text-[11px] text-[#6B6B6B] truncate max-w-[200px]">{cafe.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#1E293B] text-[#6B6B6B] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(n => <div key={n} className="h-14 rounded-xl bg-[#1E293B] animate-pulse" />)}
            </div>
          ) : lists.length === 0 ? (
            <p className="text-xs text-[#6B6B6B] text-center py-4">No lists yet. Create your first list below.</p>
          ) : (
            lists.map(list => {
              const isAdded = added.has(list.slug);
              return (
                <button key={list.id} onClick={() => !isAdded && handleAdd(list.slug)} disabled={isAdded || adding === list.slug}
                  className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    isAdded
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-[#090D16] border-[#243247] hover:border-[#0EA5E9]/40'
                  }`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{list.title}</div>
                    <div className="text-[11px] text-[#6B6B6B] flex items-center gap-1 mt-0.5">
                      {list.isPublic ? <Globe className="w-3 h-3 text-[#0EA5E9]" /> : <Lock className="w-3 h-3" />}
                      {list.isPublic ? 'Public' : 'Private'}
                    </div>
                  </div>
                  {isAdded ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <Plus className={`w-4 h-4 flex-shrink-0 ${adding === list.slug ? 'animate-spin text-[#0EA5E9]' : 'text-[#404040]'}`} />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="p-5 pt-0">
          {showCreate ? (
            <div className="flex gap-2">
              <input autoFocus placeholder="New list name…" value={newListName} onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#090D16] border border-[#243247] text-sm text-white placeholder-[#404040] focus:outline-none focus:border-[#0EA5E9]" />
              <button onClick={handleCreate} disabled={creating || !newListName.trim()}
                className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#38BDF8] disabled:opacity-50 text-black rounded-xl text-xs font-bold transition-all">
                {creating ? '…' : 'Create'}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowCreate(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-dashed border-[#243247] text-[#6B6B6B] hover:border-[#0EA5E9]/50 hover:text-[#0EA5E9] flex items-center justify-center gap-2 transition-all">
              <Plus className="w-3.5 h-3.5" />
              Create New List
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
