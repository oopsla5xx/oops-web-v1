import { expect, test } from "@playwright/test";

test("redirects the bare root to the default locale (en) and shows live status", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByText("System Status")).toBeVisible();
  await expect(page.getByText("oops-api-v1")).toBeVisible();
});

test("shows translated content on the vi locale", async ({ page }) => {
  await page.goto("/vi");

  await expect(page.getByText("Trạng thái hệ thống")).toBeVisible();
  await expect(page.getByRole("button", { name: "Làm mới" })).toBeVisible();
});

test("refresh button re-fetches the status via the internal route handler", async ({ page }) => {
  await page.goto("/en");

  await page.getByRole("button", { name: /refresh/i }).click();

  await expect(page.getByText(/last checked/i)).toBeVisible();
});

test("locale switcher changes language while staying on the same page", async ({ page }) => {
  await page.goto("/en");

  await page.getByLabel("Language").selectOption("vi");

  // Client-side navigation after a cold Turbopack compile can occasionally exceed
  // the default 5s assertion timeout under parallel test workers.
  await expect(page).toHaveURL(/\/vi$/, { timeout: 15_000 });
  await expect(page.getByText("Trạng thái hệ thống")).toBeVisible();
});
