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

  test("el home público respeta la paginación", async ({ request }) => {
    const firstPageResponse = await request.get(
      "/api/posts?homeFeed=1&sort=alpha&lang=es&limit=2&offset=0",
    );
    const secondPageResponse = await request.get(
      "/api/posts?homeFeed=1&sort=alpha&lang=es&limit=1&offset=1",
    );
    const reorderedParamsResponse = await request.get(
      "/api/posts?offset=0&limit=2&lang=es&sort=alpha&homeFeed=1",
    );

    expect(firstPageResponse.status()).toBe(200);
    expect(secondPageResponse.status()).toBe(200);
    expect(reorderedParamsResponse.status()).toBe(200);

    const firstPage = await firstPageResponse.json();
    const secondPage = await secondPageResponse.json();
    const reorderedParamsPage = await reorderedParamsResponse.json();

    expect(Array.isArray(firstPage)).toBe(true);
    expect(Array.isArray(secondPage)).toBe(true);
    expect(Array.isArray(reorderedParamsPage)).toBe(true);
    expect(firstPage.length).toBeLessThanOrEqual(2);
    expect(secondPage.length).toBeLessThanOrEqual(1);
    expect(reorderedParamsPage).toEqual(firstPage);

    if (firstPage.length > 1) {
      expect(secondPage[0]?.slug).toBe(firstPage[1]?.slug);
    }
  });
});