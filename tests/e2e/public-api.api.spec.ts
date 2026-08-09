import { test, expect } from "@playwright/test";

const publicGets = [
  "/api/posts/search?q=test",
  "/api/posts?limit=1",
  "/api/categories",
  "/api/communes",
  "/api/agenda-cultural",
  "/api/media",
  "/api/restaurant-slider-mobile",
  "/api/slider-destinations",
  "/api/slider-images",
  "/api/sliders/home",
  "/api/posts/by-category/hoteles",
  "/api/version",
] as const;

test.describe("superficie pública sin autenticación", () => {
  for (const path of publicGets) {
    test(`GET ${path} permanece público`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status(), path).toBeLessThan(500);
      expect(response.status(), path).toBeGreaterThanOrEqual(200);
    });
  }

  test("el buscador público no exige adminSite ni Bearer", async ({ request }) => {
    const response = await request.get("/api/posts/search?q=hotel&limit=5");
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toHaveProperty("items");
  });
});