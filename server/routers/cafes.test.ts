import { describe, expect, it } from "vitest";
import { cafesRouter } from "./cafes";

describe("Cafes Router", () => {
  it("should search for nearby cafes", async () => {
    const caller = cafesRouter.createCaller({});
    
    const result = await caller.searchNearby({
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 1000,
    });

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    
    // Verify cafe structure
    const cafe = result.data[0];
    expect(cafe).toHaveProperty("id");
    expect(cafe).toHaveProperty("name");
    expect(cafe).toHaveProperty("rating");
    expect(cafe).toHaveProperty("distance");
    expect(cafe).toHaveProperty("imageUrl");
  });

  it("should get cafe details by ID", async () => {
    const caller = cafesRouter.createCaller({});
    
    const result = await caller.getDetails({
      cafeId: "cafe_001",
    });

    expect(result.success).toBe(true);
    expect(result.data).not.toBeNull();
    expect(result.data?.name).toBe("Brew Haven");
    expect(result.data?.rating).toBe(4.7);
  });

  it("should return error for non-existent cafe", async () => {
    const caller = cafesRouter.createCaller({});
    
    const result = await caller.getDetails({
      cafeId: "non_existent",
    });

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
  });

  it("should get top-rated cafes", async () => {
    const caller = cafesRouter.createCaller({});
    
    const result = await caller.getTopRated({
      limit: 3,
    });

    expect(result.success).toBe(true);
    expect(result.data.length).toBeLessThanOrEqual(3);
    
    // Verify cafes are sorted by rating
    for (let i = 0; i < result.data.length - 1; i++) {
      expect(result.data[i].rating).toBeGreaterThanOrEqual(result.data[i + 1].rating);
    }
  });

  it("should filter cafes by open status", async () => {
    const caller = cafesRouter.createCaller({});
    
    const result = await caller.filter({
      openNow: true,
    });

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    
    // All returned cafes should be open
    result.data.forEach(cafe => {
      expect(cafe.isOpen).toBe(true);
    });
  });

  it("should filter cafes by minimum rating", async () => {
    const caller = cafesRouter.createCaller({});
    
    const result = await caller.filter({
      minRating: 4.5,
    });

    expect(result.success).toBe(true);
    
    // All returned cafes should have rating >= 4.5
    result.data.forEach(cafe => {
      expect(cafe.rating).toBeGreaterThanOrEqual(4.5);
    });
  });

  it("should filter cafes by price level", async () => {
    const caller = cafesRouter.createCaller({});
    
    const result = await caller.filter({
      priceLevel: "$$",
    });

    expect(result.success).toBe(true);
    
    // All returned cafes should have matching price level
    result.data.forEach(cafe => {
      expect(cafe.priceLevel).toBe("$$");
    });
  });

  it("should apply multiple filters", async () => {
    const caller = cafesRouter.createCaller({});
    
    const result = await caller.filter({
      openNow: true,
      minRating: 4.5,
      priceLevel: "$$",
    });

    expect(result.success).toBe(true);
    
    // Verify all filters are applied
    result.data.forEach(cafe => {
      expect(cafe.isOpen).toBe(true);
      expect(cafe.rating).toBeGreaterThanOrEqual(4.5);
      expect(cafe.priceLevel).toBe("$$");
    });
  });
});
