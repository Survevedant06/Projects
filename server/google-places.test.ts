import { describe, expect, it } from "vitest";
import axios from "axios";

describe("Google Places API", () => {
  it("validates the Google Places API key using Geocoding API", async () => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY environment variable is not set");
    }

    // Test with Geocoding API - simpler endpoint that validates the key
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    
    try {
      const response = await axios.get(url, {
        params: {
          address: "San Francisco, CA",
          key: apiKey,
        },
        timeout: 5000,
      });

      // Check if the response is successful
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("results");
      expect(response.data).toHaveProperty("status");
      
      // Verify the status is OK
      expect(response.data.status).toBe("OK");
      
      // Should have found the location
      expect(Array.isArray(response.data.results)).toBe(true);
      expect(response.data.results.length).toBeGreaterThan(0);
      
      console.log(`✓ Google API key is valid and properly configured.`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data);
        throw new Error(`Google API request failed: ${error.message}`);
      }
      throw error;
    }
  });
});
