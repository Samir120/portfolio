import { defineConfig, devices } from "@playwright/test";

const LOCAL_URL = "http://localhost:3000";

// Set to run the same spec against the deployed site (docs/05 §4).
const deployedUrl = process.env.PLAYWRIGHT_BASE_URL;

// https://playwright.dev/docs/test-webserver
export default defineConfig({
  testDir: "./tests",
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  use: { baseURL: deployedUrl ?? LOCAL_URL },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: deployedUrl
    ? undefined
    : {
        command: "npm run start:standalone",
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
      },
});
