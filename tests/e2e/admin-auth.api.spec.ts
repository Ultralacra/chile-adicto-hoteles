import { test, expect } from "@playwright/test";
import {
  bearer,
  getSupabaseAccessToken,
  getSupabaseCredentials,
  protectedRequests,
  sensitiveReads,
} from "./fixtures";

test.describe("contrato de autenticación admin", () => {
  for (const endpoint of protectedRequests) {
    test(`${endpoint.method} ${endpoint.path} exige Bearer`, async ({ request }) => {
      const response = await request.fetch(endpoint.path, {
        method: endpoint.method,
        data: {},
      });
      expect(response.status(), endpoint.path).toBe(401);
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        message: "unauthorized",
      });
    });

    test(`${endpoint.method} ${endpoint.path} rechaza token inválido`, async ({ request }) => {
      const response = await request.fetch(endpoint.path, {
        method: endpoint.method,
        headers: bearer("token-e2e-invalido"),
        data: {},
      });
      expect(response.status(), endpoint.path).toBe(401);
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        message: "unauthorized",
      });
    });
  }

  for (const path of sensitiveReads) {
    test(`GET ${path} no expone modo admin sin Bearer`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status(), path).toBe(401);
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        message: "unauthorized",
      });
    });

    test(`GET ${path} rechaza token inválido`, async ({ request }) => {
      const response = await request.get(path, {
        headers: bearer("token-e2e-invalido"),
      });
      expect(response.status(), path).toBe(401);
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        message: "unauthorized",
      });
    });
  }

  test.describe("usuario sin rol superadmin", () => {
    test.skip(
      !getSupabaseCredentials("E2E_NON_ADMIN"),
      "Configura E2E_NON_ADMIN_EMAIL y E2E_NON_ADMIN_PASSWORD para probar 403.",
    );

    test("rechaza una escritura con 403", async ({ request }) => {
      const credentials = getSupabaseCredentials("E2E_NON_ADMIN");
      if (!credentials) return;
      const token = await getSupabaseAccessToken(request, credentials);
      const response = await request.post("/api/categories", {
        headers: bearer(token),
        data: {},
      });
      expect(response.status()).toBe(403);
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        message: "forbidden",
      });
    });

    test("rechaza el modo admin de lectura con 403", async ({ request }) => {
      const credentials = getSupabaseCredentials("E2E_NON_ADMIN");
      if (!credentials) return;
      const token = await getSupabaseAccessToken(request, credentials);
      const response = await request.get(
        "/api/posts/search?q=test&adminSite=santiagoadicto",
        { headers: bearer(token) },
      );
      expect(response.status()).toBe(403);
    });
  });

  test.describe("superadmin", () => {
    test.skip(
      !getSupabaseCredentials("E2E_ADMIN"),
      "Configura E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para probar acceso superadmin.",
    );

    test("puede consultar el buscador administrativo", async ({ request }) => {
      const credentials = getSupabaseCredentials("E2E_ADMIN");
      if (!credentials) return;
      const token = await getSupabaseAccessToken(request, credentials);
      const response = await request.get(
        "/api/posts/search?q=test&adminSite=santiagoadicto",
        { headers: bearer(token) },
      );
      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toHaveProperty("items");
    });
  });
});