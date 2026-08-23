'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Star, MapPin, Wifi, Zap, Volume1, Clock, Bookmark, Share2,
  Plus, Globe, Phone, CheckCircle2, Sparkles, ArrowLeft,
  Dog, Wind, Coffee, Armchair, Sun, ExternalLink
} from 'lucide-react';
import { CafeItem, CafeReview } from '@/lib/types';
import { WifiBadge, PlugBadge, NoiseBadge, AmenityPill } from '@/components/cafes/AmenityBadge';
import SpeedTestWidget from '@/components/cafes/SpeedTestWidget';
import ReviewSection from '@/components/cafes/ReviewSection';
import AddToListModal from '@/components/lists/AddToListModal';
import { formatPlugDensity, formatNoiseLevel, formatSeatingComfort, formatLighting, formatPrice } from '@/lib/utils';

export default function CafeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [cafe, setCafe] = useState<CafeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) fetch(`/api/cafes/${slug}`).then(r => r.json()).then(d => {
      if (d.success) setCafe(d.cafe);
      setLoading(false);
    });
  }, [slug]);

  const handleBookmark = async () => {
    if (!cafe) return;
    const res = await fetch('/api/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cafeId: cafe.id }) });
    const d = await res.json();
    if (d.success) setBookmarked(d.bookmarked);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-10 h-10 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-[#6B6B6B]">Loading workspace profile…</p>
    </div>
  );

  if (!cafe) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
      <Coffee className="w-12 h-12 text-[#243247] mx-auto" />
      <h2 className="text-xl font-bold text-white">Cafe Not Found</h2>
      <Link href="/" className="inline-block px-5 py-2.5 bg-[#0EA5E9] text-black rounded-xl text-sm font-bold">← Back to Directory</Link>
    </div>
  );

  let images: string[] = [];
  try { images = JSON.parse(cafe.images as string); } catch { images = [cafe.coverImage]; }

  let hours: Record<string, string> = {};
  try { hours = JSON.parse(cafe.openingHours as string); } catch { hours = { daily: '8:00 AM – 8:00 PM' }; }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#0EA5E9] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="px-3 py-1.5 rounded-xl border border-[#243247] bg-[#0F172A] hover:border-[#0EA5E9]/40 text-xs font-semibold text-[#A0A0A0] hover:text-white flex items-center gap-1.5 transition-all">
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button onClick={() => setModalOpen(true)} className="px-3 py-1.5 rounded-xl border border-[#243247] bg-[#0F172A] hover:border-[#0EA5E9]/40 text-xs font-semibold text-[#A0A0A0] hover:text-white flex items-center gap-1.5 transition-all">
            <Plus className="w-3.5 h-3.5 text-[#0EA5E9]" />
            Add to List
          </button>
          <button onClick={handleBookmark} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${bookmarked ? 'bg-[#0EA5E9] text-black shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border border-[#243247] bg-[#0F172A] text-[#A0A0A0] hover:border-[#0EA5E9]/40 hover:text-white'}`}>
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-3xl overflow-hidden max-h-[420px] border border-[#243247]">
        <div className="md:col-span-2 relative h-72 md:h-full">
          <img src={cafe.coverImage} alt={cafe.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {cafe.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0EA5E9] text-black shadow">
                  <CheckCircle2 className="w-3 h-3" /> Verified Workspace
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-black/60 border border-white/10 text-[#A0A0A0]">
                {formatPrice(cafe.priceLevel)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{cafe.name}</h1>
            {cafe.tagline && <p className="text-sm text-[#A0A0A0] mt-1">{cafe.tagline}</p>}
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          {images.slice(1, 3).map((img, i) => (
            <div key={i} className="flex-1 overflow-hidden">
              <img src={img} alt={`${cafe.name} ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Telemetry Grid */}
          <div className="bg-[#0F172A] border border-[#243247] rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
              Workspace Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* WiFi */}
              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1.5">
                  <Wifi className="w-3.5 h-3.5" />Verified WiFi
                </div>
                <div className="font-mono text-xl font-black text-emerald-300">{cafe.wifiSpeedMbps}<span className="text-xs font-normal text-emerald-500 ml-1">Mbps</span></div>
                <div className="text-[11px] text-emerald-600 mt-0.5">{cafe.wifiReliability.replace('_', ' ')}</div>
              </div>
              {/* Outlets */}
              <div className="p-4 bg-[#0EA5E9]/5 rounded-xl border border-[#0EA5E9]/15">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0EA5E9] mb-1.5">
                  <Zap className="w-3.5 h-3.5" />Outlets
                </div>
                <div className="font-bold text-sm text-white mt-1 leading-snug">{formatPlugDensity(cafe.powerPlugDensity).label}</div>
                <div className="text-[11px] text-[#6B6B6B] mt-0.5">Tableside access</div>
              </div>
              {/* Noise */}
              <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-1.5">
                  <Volume1 className="w-3.5 h-3.5" />Noise Level
                </div>
                <div className="font-bold text-sm text-white mt-1 leading-snug">{formatNoiseLevel(cafe.noiseLevel).label}</div>
                <div className="text-[11px] text-[#6B6B6B] mt-0.5">Focus-friendly</div>
              </div>
              {/* Seating */}
              <div className="p-4 bg-teal-500/5 rounded-xl border border-teal-500/20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 mb-1.5">
                  <Armchair className="w-3.5 h-3.5" />Seating
                </div>
                <div className="font-bold text-xs text-white mt-1 leading-snug line-clamp-2">{formatSeatingComfort(cafe.seatingComfort)}</div>
                <div className="text-[11px] text-[#6B6B6B] mt-0.5">{cafe.seatingCapacity.toLowerCase()} capacity</div>
              </div>
            </div>

            {cafe.wifiPasswordNote && (
              <div className="p-3 bg-[#090D16] rounded-xl border border-[#243247] text-xs text-[#A0A0A0] flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-[#0EA5E9] flex-shrink-0" />
                <span><strong className="text-white">Wi-Fi Note:</strong> {cafe.wifiPasswordNote}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-[#0F172A] border border-[#243247] rounded-2xl p-6">
            <h3 className="font-bold text-base text-white mb-3">About This Workspace</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">{cafe.description}</p>
          </div>

          {/* Speed Test */}
          <SpeedTestWidget cafeSlug={cafe.slug} currentAvgDownload={cafe.wifiSpeedMbps} currentAvgUpload={cafe.wifiUploadMbps}
            onSpeedUpdated={(dl, ul) => setCafe({ ...cafe, wifiSpeedMbps: dl, wifiUploadMbps: ul })} />

          {/* Amenities Checklist */}
          <div className="bg-[#0F172A] border border-[#243247] rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white">Nomad Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <AmenityPill icon={Wifi} label="High-Speed Wi-Fi" highlight={cafe.hasWifi} />
              <AmenityPill icon={Zap} label={formatPlugDensity(cafe.powerPlugDensity).label} highlight={['AT_EVERY_SEAT','PLENTIFUL'].includes(cafe.powerPlugDensity)} />
              <AmenityPill icon={Sun} label={formatLighting(cafe.lighting)} highlight />
              <AmenityPill icon={Dog} label={cafe.isPetFriendly ? 'Pet Friendly 🐶' : 'No Pets'} highlight={cafe.isPetFriendly} />
              <AmenityPill icon={Wind} label={cafe.hasAirConditioning ? 'Air Conditioned' : 'Natural Ventilation'} highlight={cafe.hasAirConditioning} />
              <AmenityPill icon={Coffee} label={cafe.specialtyCoffee ? `Specialty Roasters${cafe.roasterName ? ` (${cafe.roasterName.split('&')[0].trim()})` : ''}` : 'Standard Coffee'} highlight={cafe.specialtyCoffee} />
              <AmenityPill icon={Clock} label={cafe.openLate ? 'Open Late (Past 8 PM)' : 'Standard Daytime Hours'} highlight={cafe.openLate} />
              {cafe.hasCallBooths && <AmenityPill icon={Phone} label="Phone / Call Pods" highlight />}
              {cafe.hasMeetingRooms && <AmenityPill icon={Armchair} label="Meeting Rooms" highlight />}
              {cafe.hasOutdoorSeating && <AmenityPill icon={Sun} label="Outdoor Patio" highlight />}
              {cafe.hasParking && <AmenityPill icon={MapPin} label="Free Parking" highlight />}
            </div>
          </div>

          {/* Reviews */}
          <ReviewSection cafeSlug={cafe.slug} cafeName={cafe.name} reviews={cafe.reviews || []} averageRating={cafe.averageRating} />
        </div>

        {/* Right Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0F172A] border border-[#243247] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white">Location & Hours</h3>
            <div className="space-y-3 text-xs text-[#6B6B6B]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">{cafe.address}</div>
                  <div className="text-[#6B6B6B]">{cafe.neighborhood ? `${cafe.neighborhood}, ` : ''}{cafe.city}</div>
                </div>
              </div>
              {cafe.phone && <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-[#404040] flex-shrink-0" /><span>{cafe.phone}</span></div>}
              {cafe.website && (
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#404040] flex-shrink-0" />
                  <a href={cafe.website} target="_blank" rel="noopener noreferrer" className="text-[#0EA5E9] hover:underline flex items-center gap-1">
                    Website <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#0EA5E9] hover:bg-[#38BDF8] text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:shadow-[0_0_25px_rgba(14,165,233,0.4)]"
            >
              <MapPin className="w-3.5 h-3.5" />
              Get Directions
            </a>

            {/* Map embed preview with pin */}
            <div className="w-full h-40 rounded-xl overflow-hidden border border-[#243247]">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${cafe.lng - 0.01}%2C${cafe.lat - 0.008}%2C${cafe.lng + 0.01}%2C${cafe.lat + 0.008}&layer=mapnik&marker=${cafe.lat}%2C${cafe.lng}`}
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* Opening Hours */}
            <div className="pt-3 border-t border-[#243247]">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Opening Hours</h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(hours).map(([day, time]) => (
                  <div key={day} className="flex items-center justify-between text-[#6B6B6B]">
                    <span className="capitalize font-medium">{day}</span>
                    <span className="text-white font-semibold">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && <AddToListModal cafe={cafe} isOpen={modalOpen} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
