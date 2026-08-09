import { test, expect } from "@playwright/test";
import { getSupabaseCredentials } from "./fixtures";

test.describe("modal global de autenticación admin", () => {
  test.skip(
    !getSupabaseCredentials("E2E_ADMIN"),
    "Configura E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para probar el modal en navegador.",
  );

  async function login(page: import("@playwright/test").Page) {
    const credentials = getSupabaseCredentials("E2E_ADMIN");
    if (!credentials) return;
    await page.goto("/admin/login");
    await page.getByLabel("Correo electrónico").fill(credentials.email);
    await page.getByLabel("Contraseña").fill(credentials.password);
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();
    await page.waitForURL("**/admin");
  }

  test("muestra sesión expirada y vuelve al login ante 401", async ({ page }) => {
    await login(page);
    await page.route("**/api/posts**", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, message: "unauthorized" }),
      }),
    );
    await page.goto("/admin/posts");
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(page.getByText("Sesión expirada")).toBeVisible();
    await page.getByRole("button", { name: "Volver al acceso" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("muestra falta de permisos ante 403 y permite cerrar", async ({ page }) => {
    await login(page);
    await page.route("**/api/posts**", (route) =>
      route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, message: "forbidden" }),
      }),
    );
    await page.goto("/admin/posts");
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(page.getByText("Acceso no autorizado")).toBeVisible();
    await page.getByRole("button", { name: "Cerrar" }).click();
    await expect(page.getByRole("alertdialog")).toBeHidden();
    await expect(page).toHaveURL(/\/admin\/posts$/);
  });
});