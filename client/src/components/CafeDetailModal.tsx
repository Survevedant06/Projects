import { useState } from 'react';
import { X, MapPin, Phone, Globe, Clock, Star, Heart, Share2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Review {
  author: string;
  rating: number;
  text: string;
}

interface CafeDetailModalProps {
  cafe: {
    id: string;
    name: string;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    distance: number;
    address: string;
    isOpen: boolean;
    reviews: Review[];
    priceLevel: string;
    phone: string;
    website: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CafeDetailModal({ cafe, isOpen, onClose }: CafeDetailModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');

  if (!isOpen || !cafe) return null;

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    const text = `Check out ${cafe.name} - ${cafe.rating}⭐ on Cafe Finder!`;
    if (navigator.share) {
      navigator.share({
        title: cafe.name,
        text: text,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Cafe info copied to clipboard!');
    }
  };

  const handleGetDirections = () => {
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(cafe.address)}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <Card className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header with Image */}
          <div className="relative h-64 overflow-hidden bg-amber-100">
            <img
              src={cafe.imageUrl}
              alt={cafe.name}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-lg"
            >
              <X className="w-5 h-5 text-amber-900" />
            </button>

            {/* Rating Badge */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(cafe.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-amber-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-amber-900">{cafe.rating}</span>
              <span className="text-xs text-amber-700">({cafe.reviewCount} reviews)</span>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-full backdrop-blur transition-all duration-200 ${
                  isFavorite
                    ? 'bg-red-500/90 text-white'
                    : 'bg-white/90 hover:bg-white text-amber-900'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/90 hover:bg-white text-amber-900 backdrop-blur transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Status */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-amber-900 mb-2">{cafe.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  cafe.isOpen
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {cafe.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                </span>
                <span className="text-amber-700 font-medium">{cafe.priceLevel}</span>
                <span className="text-amber-600 text-sm">{cafe.distance.toFixed(1)} km away</span>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {/* Address */}
              <div className="flex gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-700 font-semibold">Address</p>
                  <p className="text-sm text-amber-900 break-words">{cafe.address}</p>
                </div>
              </div>

              {/* Phone */}
              <a
                href={`tel:${cafe.phone}`}
                className="flex gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Phone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-700 font-semibold">Phone</p>
                  <p className="text-sm text-amber-900">{cafe.phone}</p>
                </div>
              </a>

              {/* Website */}
              <a
                href={cafe.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Globe className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-700 font-semibold">Website</p>
                  <p className="text-sm text-amber-900 truncate">Visit Website</p>
                </div>
              </a>

              {/* Hours */}
              <div className="flex gap-3 p-3 bg-amber-50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-700 font-semibold">Hours</p>
                  <p className="text-sm text-amber-900">Mon-Sun: 7AM - 9PM</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleGetDirections}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white gap-2"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </Button>
              <Button
                onClick={() => window.open(cafe.website)}
                variant="outline"
                className="flex-1 border-amber-300 text-amber-900 hover:bg-amber-50"
              >
                Visit Website
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-amber-200 mb-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-1 font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 px-1 font-semibold transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                Reviews ({cafe.reviews.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">About</h3>
                  <p className="text-sm text-amber-800">
                    {cafe.name} is a highly-rated cafe offering premium coffee and a welcoming atmosphere.
                    With an impressive {cafe.rating} star rating from {cafe.reviewCount} customers,
                    it's a popular destination for coffee enthusiasts and remote workers alike.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Highlights</h3>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li className="flex gap-2">
                      <span className="text-amber-500">✓</span>
                      <span>Premium quality coffee and espresso</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500">✓</span>
                      <span>Comfortable seating and ambiance</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500">✓</span>
                      <span>Free WiFi for customers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500">✓</span>
                      <span>Friendly and knowledgeable staff</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cafe.reviews.length === 0 ? (
                  <p className="text-center text-amber-700 py-8">No reviews yet</p>
                ) : (
                  cafe.reviews.map((review, idx) => (
                    <div key={idx} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-amber-900">{review.author}</p>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-amber-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-amber-800">{review.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
