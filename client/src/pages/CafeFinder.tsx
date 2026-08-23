import { useState, useEffect } from 'react';
import { MapPin, Star, Clock, MapPinIcon, Search, Filter, ChevronDown, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import CafeDetailModal from '@/components/CafeDetailModal';

/**
 * Design Philosophy: Warm, Welcoming Cafe Discovery
 * - Clean, modern interface with warm color accents
 * - High-quality cafe images as focal points
 * - Easy geolocation and search functionality
 * - Responsive card-based layout for mobile-first experience
 */

interface Cafe {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  distance: number;
  address: string;
  isOpen: boolean;
  reviews: Array<{ author: string; rating: number; text: string }>;
  priceLevel: string;
  phone: string;
  website: string;
}

export default function CafeFinder() {
  const [selectedFilters, setSelectedFilters] = useState({
    openNow: false,
    topRated: false,
    priceRange: 'all' as 'all' | '$' | '$$' | '$$$',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch cafes from backend
  const { data: cafesData, isLoading: isFetching } = trpc.cafes.searchNearby.useQuery(
    {
      latitude: userLocation?.lat || 37.7749,
      longitude: userLocation?.lng || -122.4194,
      radius: 2000,
    },
    { enabled: !!userLocation }
  );

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Use default San Francisco location if geolocation fails
          setUserLocation({
            lat: 37.7749,
            lng: -122.4194,
          });
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  // Update cafes when data arrives
  useEffect(() => {
    if (cafesData?.success && cafesData.data) {
      setCafes(cafesData.data as Cafe[]);
    }
  }, [cafesData]);

  // Filter cafes based on selected filters and search query
  const filteredCafes = cafes.filter(cafe => {
    const matchesSearch = cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cafe.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOpenNow = !selectedFilters.openNow || cafe.isOpen;
    const matchesTopRated = !selectedFilters.topRated || cafe.rating >= 4.5;
    const matchesPrice = selectedFilters.priceRange === 'all' || cafe.priceLevel === selectedFilters.priceRange;

    return matchesSearch && matchesOpenNow && matchesTopRated && matchesPrice;
  });

  const toggleFilter = (filterName: 'openNow' | 'topRated') => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  const handlePriceRangeChange = (range: 'all' | '$' | '$$' | '$$$') => {
    setSelectedFilters(prev => ({
      ...prev,
      priceRange: range,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Cafe Finder</h1>
              <p className="text-sm text-amber-700">Discover the best cafes near you</p>
            </div>
            {userLocation && (
              <div className="text-right text-sm text-amber-700">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location detected
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-amber-400" />
              <Input
                placeholder="Search cafes or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-amber-200 focus:border-amber-400"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-amber-200 text-amber-900 hover:bg-amber-50 gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.openNow}
                      onChange={() => toggleFilter('openNow')}
                      className="w-4 h-4 border-amber-300 text-amber-600 rounded"
                    />
                    <span className="text-sm font-medium">Open Now</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.topRated}
                      onChange={() => toggleFilter('topRated')}
                      className="w-4 h-4 border-amber-300 text-amber-600 rounded"
                    />
                    <span className="text-sm font-medium">Top Rated (4.5+)</span>
                  </label>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Price Range</p>
                  <div className="space-y-2">
                    {(['all', '$', '$$', '$$$'] as const).map((range) => (
                      <label key={range} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={selectedFilters.priceRange === range}
                          onChange={() => handlePriceRangeChange(range)}
                          className="w-4 h-4 border-amber-300 text-amber-600"
                        />
                        <span className="text-sm">{range === 'all' ? 'All Prices' : range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading || isFetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
              <p className="text-amber-700">Finding cafes near you...</p>
            </div>
          </div>
        ) : filteredCafes.length === 0 ? (
          <div className="text-center py-16">
            <MapPinIcon className="w-12 h-12 text-amber-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-900 mb-2">No cafes found</h2>
            <p className="text-amber-700">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-amber-700 mb-4">
              Found {filteredCafes.length} cafe{filteredCafes.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCafes.map((cafe) => (
                <Card key={cafe.id} className="overflow-hidden hover:shadow-lg transition-shadow border-amber-100">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-amber-100">
                    <img
                      src={cafe.imageUrl}
                      alt={cafe.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-amber-900">{cafe.rating}</span>
                    </div>
                    {!cafe.isOpen && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-semibold">Closed</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-amber-900 mb-1">{cafe.name}</h3>
                    <p className="text-xs text-amber-700 mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {cafe.distance.toFixed(1)} km away
                    </p>

                    {/* Rating and Reviews */}
                    <div className="mb-3">
                      <p className="text-xs text-amber-600 mb-2">
                        {cafe.reviewCount} reviews • {cafe.priceLevel}
                      </p>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(cafe.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-amber-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Top Reviews */}
                    <div className="mb-4 space-y-2 bg-amber-50 p-3 rounded">
                      {cafe.reviews.slice(0, 2).map((review, idx) => (
                        <div key={idx} className="text-xs">
                          <p className="font-semibold text-amber-900">{review.author}</p>
                          <p className="text-amber-700 line-clamp-2">{review.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Status and Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className={`w-4 h-4 ${cafe.isOpen ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={cafe.isOpen ? 'text-green-600' : 'text-red-600'}>
                          {cafe.isOpen ? 'Open now' : 'Closed'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => {
                          setSelectedCafe(cafe);
                          setIsModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <CafeDetailModal
        cafe={selectedCafe}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
