import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/about", "/projects", "/projects/swadestack", "/contact"];

for (const route of ROUTES) {
  test(`${route} loads cleanly`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(route, { waitUntil: "load" });

    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);

    const unsafe = await page
      .locator('a[href^="http"]')
      .evaluateAll((links) =>
        links
          .filter((link) => !link.getAttribute("rel")?.includes("noopener"))
          .map((link) => link.getAttribute("href")),
      );
    expect(unsafe).toEqual([]);

    expect(errors).toEqual([]);
  });
}

test("an unknown route gets the themed 404", async ({ page }) => {
  const response = await page.goto("/nope");

  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Not found.");
  await expect(page.locator("html")).toHaveAttribute("data-theme", /.+/);
});

test("T changes the theme and it survives a reload", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");

  // The key listener attaches at hydration; retry until it has.
  await expect(async () => {
    await page.keyboard.press("t");
    await expect(html).not.toHaveAttribute("data-theme", before ?? "", {
      timeout: 200,
    });
  }).toPass();

  const after = await html.getAttribute("data-theme");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", after ?? "");
});
