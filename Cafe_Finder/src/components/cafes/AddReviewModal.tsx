'use client';

import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { CafeReview } from '@/lib/types';

interface AddReviewModalProps {
  cafeSlug: string;
  cafeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: CafeReview) => void;
}

export default function AddReviewModal({ cafeSlug, cafeName, isOpen, onClose, onSuccess }: AddReviewModalProps) {
  const [authorName, setAuthorName] = useState('');
  const [ratings, setRatings] = useState({ overall: 5, wifi: 5, noise: 4, outlet: 4, comfort: 5, coffee: 5 });
  const [reportedWifiSpeed, setReportedWifiSpeed] = useState('');
  const [visitTiming, setVisitTiming] = useState('Afternoon');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Coding', 'Deep Focus']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const tags = ['Coding', 'Deep Focus', 'Zoom Calls', 'Group Work', 'Reading & Writing', 'Great Coffee', 'Late Night', 'Comfortable Seating', 'Natural Light'];

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const StarInput = ({ label, field }: { label: string; field: keyof typeof ratings }) => (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs font-medium text-[#A0A0A0]">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} type="button" onClick={() => setRatings(r => ({ ...r, [field]: s }))} className="p-0.5 hover:scale-125 transition-transform">
            <Star className={`w-4 h-4 ${s <= ratings[field] ? 'text-[#0EA5E9] fill-[#0EA5E9]' : 'text-[#243247]'}`} />
          </button>
        ))}
        <span className="text-xs font-bold text-[#6B6B6B] w-4 text-right">{ratings[field]}</span>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!authorName.trim() || !comment.trim()) { setError('Name and review are required.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cafes/${cafeSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName, overallRating: ratings.overall, wifiRating: ratings.wifi,
          noiseRating: ratings.noise, outletRating: ratings.outlet, comfortRating: ratings.comfort,
          coffeeRating: ratings.coffee, reportedWifiSpeed: reportedWifiSpeed ? parseFloat(reportedWifiSpeed) : null,
          comment, bestForTags: selectedTags, visitTiming,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      onSuccess(data.review);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-[#243247] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#243247]">
          <div>
            <h3 className="font-bold text-base text-white">Review: {cafeName}</h3>
            <p className="text-xs text-[#6B6B6B] mt-0.5">Help other nomads find productive spaces</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#1E293B] text-[#6B6B6B] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Your Name</label>
            <input
              type="text" required placeholder="e.g. Alex Rivera (@nomadcoder)"
              value={authorName} onChange={e => setAuthorName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-sm text-white placeholder-[#404040] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
            />
          </div>

          <div className="bg-[#090D16] border border-[#243247] rounded-2xl p-4 space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Workspace Criteria</h4>
            <StarInput label="Overall Experience" field="overall" />
            <StarInput label="Wi-Fi Reliability & Speed" field="wifi" />
            <StarInput label="Quietness / Noise Level" field="noise" />
            <StarInput label="Power Outlet Access" field="outlet" />
            <StarInput label="Seating & Ergonomics" field="comfort" />
            <StarInput label="Coffee & Food Quality" field="coffee" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Measured Speed (Mbps)</label>
              <input type="number" placeholder="e.g. 150" value={reportedWifiSpeed} onChange={e => setReportedWifiSpeed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#243247] text-xs text-white placeholder-[#404040] focus:outline-none focus:border-[#0EA5E9]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Time of Visit</label>
              <select value={visitTiming} onChange={e => setVisitTiming(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#243247] text-xs text-white focus:outline-none focus:border-[#0EA5E9]">
                <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Weekend</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] mb-1.5">Best Suited For</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    selectedTags.includes(tag)
                      ? 'bg-[#0EA5E9] text-black border-[#0EA5E9] font-bold'
                      : 'bg-[#1E293B] text-[#6B6B6B] border-[#243247] hover:border-[#0EA5E9]/40'
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Review & Tips</label>
            <textarea required rows={3} placeholder="Describe the vibe, where to find the best seats with outlets, wifi notes, etc."
              value={comment} onChange={e => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-[#243247] text-xs text-white placeholder-[#404040] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#243247]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-[#6B6B6B] hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0EA5E9] hover:bg-[#38BDF8] text-black flex items-center gap-1.5 shadow-[0_0_20px_rgba(14,165,233,0.2)] transition-all">
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Publishing…' : 'Publish Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
