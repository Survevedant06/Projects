'use client';

import React, { useState } from 'react';
import { Star, Wifi, Volume1, Zap, Armchair, Coffee, Plus, Clock, MessageSquare } from 'lucide-react';
import { CafeReview } from '@/lib/types';
import AddReviewModal from './AddReviewModal';

interface ReviewSectionProps {
  cafeSlug: string;
  cafeName: string;
  reviews: CafeReview[];
  averageRating: number;
  onReviewAdded?: (r: CafeReview) => void;
}

export default function ReviewSection({
  cafeSlug,
  cafeName,
  reviews,
  averageRating,
  onReviewAdded,
}: ReviewSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewList, setReviewList] = useState<CafeReview[]>(reviews);

  const avg = React.useMemo(() => {
    if (!reviewList.length) return { wifi: 5, noise: 4.5, outlet: 4.5, comfort: 4.5, coffee: 5 };
    const n = reviewList.length;
    return {
      wifi: reviewList.reduce((s, r) => s + r.wifiRating, 0) / n,
      noise: reviewList.reduce((s, r) => s + r.noiseRating, 0) / n,
      outlet: reviewList.reduce((s, r) => s + r.outletRating, 0) / n,
      comfort: reviewList.reduce((s, r) => s + r.comfortRating, 0) / n,
      coffee: reviewList.reduce((s, r) => s + r.coffeeRating, 0) / n,
    };
  }, [reviewList]);

  const handleReviewCreated = (r: CafeReview) => {
    setReviewList([r, ...reviewList]);
    if (onReviewAdded) onReviewAdded(r);
  };

  const criteria = [
    { icon: Wifi, key: 'wifi', label: 'Wi-Fi Quality', color: 'bg-emerald-500', val: avg.wifi },
    { icon: Volume1, key: 'noise', label: 'Quietness', color: 'bg-indigo-500', val: avg.noise },
    { icon: Zap, key: 'outlet', label: 'Power Outlets', color: 'bg-[#0EA5E9]', val: avg.outlet },
    { icon: Armchair, key: 'comfort', label: 'Seating Comfort', color: 'bg-teal-500', val: avg.comfort },
    { icon: Coffee, key: 'coffee', label: 'Coffee & Food', color: 'bg-rose-500', val: avg.coffee },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-[#0F172A] border border-[#243247] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#243247]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0EA5E9] text-black flex flex-col items-center justify-center font-black shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              <span className="text-2xl leading-none">{averageRating > 0 ? averageRating.toFixed(1) : '5.0'}</span>
              <div className="flex mt-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Community Rating</h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                {reviewList.length} verified nomad {reviewList.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#0EA5E9] hover:bg-[#38BDF8] text-black flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.2)] transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Write a Review
          </button>
        </div>

        {/* Criteria bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-5">
          {criteria.map(({ icon: Icon, label, color, val }) => (
            <div key={label} className="bg-[#090D16] rounded-xl p-3 border border-[#243247]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#A0A0A0] mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[#0EA5E9]" />
                  <span className="truncate">{label}</span>
                </div>
                <span className="font-mono text-white">{val.toFixed(1)}</span>
              </div>
              <div className="w-full bg-[#243247] h-1.5 rounded-full overflow-hidden">
                <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${(val / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#0EA5E9]" />
          Nomad Experiences ({reviewList.length})
        </h4>

        {reviewList.length === 0 ? (
          <div className="text-center py-10 bg-[#0F172A] border border-[#243247] rounded-2xl">
            <Coffee className="w-10 h-10 text-[#243247] mx-auto mb-2" />
            <p className="text-sm text-[#6B6B6B]">No reviews yet — be the first to share your experience!</p>
          </div>
        ) : (
          reviewList.map(review => {
            let tags: string[] = [];
            try { if (review.bestForTags) tags = JSON.parse(review.bestForTags as string); } catch {}
            return (
              <div key={review.id} className="bg-[#0F172A] border border-[#243247] rounded-2xl p-5 hover:border-[#3A3A3A] transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(review.authorName)}`}
                      alt={review.authorName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#243247]"
                    />
                    <div>
                      <div className="font-bold text-sm text-white">{review.authorName}</div>
                      {review.visitTiming && (
                        <div className="text-[11px] text-[#6B6B6B] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {review.visitTiming}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 text-[#0EA5E9] font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {review.overallRating}.0
                  </div>
                </div>

                <p className="text-sm text-[#A0A0A0] leading-relaxed">{review.comment}</p>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1E1E1E] text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-[#1E293B] text-[#A0A0A0] border border-[#243247]">📶 WiFi {review.wifiRating}/5</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#1E293B] text-[#A0A0A0] border border-[#243247]">🔌 Outlets {review.outletRating}/5</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#1E293B] text-[#A0A0A0] border border-[#243247]">🤫 Noise {review.noiseRating}/5</span>
                  {review.reportedWifiSpeed && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      🚀 Tested: {review.reportedWifiSpeed} Mbps
                    </span>
                  )}
                  {tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20">#{tag}</span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {modalOpen && (
        <AddReviewModal
          cafeSlug={cafeSlug}
          cafeName={cafeName}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleReviewCreated}
        />
      )}
    </div>
  );
}
