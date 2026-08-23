import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import axios from "axios";
import { ENV } from "../_core/env";

// Mock cafe data for development - will be replaced with real API calls
const MOCK_CAFES = [
  {
    id: "cafe_001",
    name: "Brew Haven",
    address: "123 Main St, San Francisco, CA 94102",
    rating: 4.7,
    reviewCount: 342,
    isOpen: true,
    distance: 0.3,
    imageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=400&fit=crop",
    reviews: [
      { author: "Sarah M.", rating: 5, text: "Amazing coffee and cozy atmosphere!" },
      { author: "John D.", rating: 5, text: "Best espresso in the city" },
      { author: "Emma L.", rating: 4, text: "Great pastries, a bit crowded on weekends" },
    ],
    priceLevel: "$$",
    phone: "(415) 555-0101",
    website: "https://brewhaven.example.com",
  },
  {
    id: "cafe_002",
    name: "The Daily Grind",
    address: "456 Market St, San Francisco, CA 94102",
    rating: 4.5,
    reviewCount: 287,
    isOpen: true,
    distance: 0.5,
    imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&h=400&fit=crop",
    reviews: [
      { author: "Mike T.", rating: 5, text: "Perfect spot for remote work" },
      { author: "Lisa K.", rating: 4, text: "Good coffee, friendly staff" },
      { author: "Alex R.", rating: 4, text: "Nice outdoor seating area" },
    ],
    priceLevel: "$$",
    phone: "(415) 555-0102",
    website: "https://thedailygrind.example.com",
  },
  {
    id: "cafe_003",
    name: "Artisan Coffee Co.",
    address: "789 Valencia St, San Francisco, CA 94103",
    rating: 4.8,
    reviewCount: 512,
    isOpen: true,
    distance: 0.7,
    imageUrl: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=500&h=400&fit=crop",
    reviews: [
      { author: "Rachel P.", rating: 5, text: "Exceptional quality, worth the visit" },
      { author: "Chris M.", rating: 5, text: "Knowledgeable baristas, premium beans" },
      { author: "Nina S.", rating: 5, text: "Beautiful interior design" },
    ],
    priceLevel: "$$$",
    phone: "(415) 555-0103",
    website: "https://artisancoffeeco.example.com",
  },
  {
    id: "cafe_004",
    name: "Morning Bliss",
    address: "321 Mission St, San Francisco, CA 94103",
    rating: 4.3,
    reviewCount: 198,
    isOpen: false,
    distance: 0.8,
    imageUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&h=400&fit=crop",
    reviews: [
      { author: "Tom B.", rating: 4, text: "Good vibes and decent coffee" },
      { author: "Jessica L.", rating: 4, text: "Nice for a quick break" },
      { author: "David H.", rating: 4, text: "Reasonable prices" },
    ],
    priceLevel: "$",
    phone: "(415) 555-0104",
    website: "https://morningbliss.example.com",
  },
  {
    id: "cafe_005",
    name: "Espresso Express",
    address: "654 Pine St, San Francisco, CA 94108",
    rating: 4.6,
    reviewCount: 421,
    isOpen: true,
    distance: 1.2,
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a36c86d?w=500&h=400&fit=crop",
    reviews: [
      { author: "Paul W.", rating: 5, text: "Fast service, excellent quality" },
      { author: "Maria G.", rating: 5, text: "My go-to spot for morning coffee" },
      { author: "Kevin T.", rating: 4, text: "Great location, always busy" },
    ],
    priceLevel: "$$",
    phone: "(415) 555-0105",
    website: "https://espressoexpress.example.com",
  },
];

export const cafesRouter = router({
  // Search for cafes near a location
  searchNearby: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().default(1000), // in meters
        type: z.enum(["cafe", "coffee"]).default("cafe"),
      })
    )
    .query(async ({ input }) => {
      try {
        // For now, return mock data
        // In production, this would call the Google Places API
        const filteredCafes = MOCK_CAFES.map(cafe => ({
          ...cafe,
          distance: Math.random() * 2, // Simulate varying distances
        })).sort((a, b) => a.distance - b.distance);

        return {
          success: true,
          data: filteredCafes,
          message: "Cafes retrieved successfully",
        };
      } catch (error) {
        console.error("Error searching cafes:", error);
        return {
          success: false,
          data: [],
          message: "Failed to search cafes",
        };
      }
    }),

  // Get details for a specific cafe
  getDetails: publicProcedure
    .input(z.object({ cafeId: z.string() }))
    .query(({ input }) => {
      const cafe = MOCK_CAFES.find(c => c.id === input.cafeId);
      
      if (!cafe) {
        return {
          success: false,
          data: null,
          message: "Cafe not found",
        };
      }

      return {
        success: true,
        data: cafe,
        message: "Cafe details retrieved successfully",
      };
    }),

  // Get top-rated cafes
  getTopRated: publicProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(({ input }) => {
      const topRated = MOCK_CAFES
        .sort((a, b) => b.rating - a.rating)
        .slice(0, input.limit);

      return {
        success: true,
        data: topRated,
        message: "Top-rated cafes retrieved successfully",
      };
    }),

  // Filter cafes by criteria
  filter: publicProcedure
    .input(
      z.object({
        openNow: z.boolean().optional(),
        minRating: z.number().optional(),
        maxDistance: z.number().optional(),
        priceLevel: z.enum(["$", "$$", "$$$"]).optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...MOCK_CAFES];

      if (input.openNow !== undefined) {
        filtered = filtered.filter(c => c.isOpen === input.openNow);
      }

      if (input.minRating !== undefined) {
        filtered = filtered.filter(c => c.rating >= input.minRating!);
      }

      if (input.maxDistance !== undefined) {
        filtered = filtered.filter(c => c.distance <= input.maxDistance!);
      }

      if (input.priceLevel !== undefined) {
        filtered = filtered.filter(c => c.priceLevel === input.priceLevel);
      }

      return {
        success: true,
        data: filtered,
        message: "Filtered cafes retrieved successfully",
      };
    }),
});

export type CafesRouter = typeof cafesRouter;
