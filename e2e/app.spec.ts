import { test, expect } from "@playwright/test";

const ADMIN_PASSWORD = "admin123";

// Desktop viewport so sm: breakpoints don't hide elements
test.use({ viewport: { width: 1280, height: 800 } });

// Helper: wait for storefront data to finish loading
async function waitForStorefront(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Wait for products to appear (the "N products found" text means data loaded)
  await expect(
    page.getByText(/\d+ products? found/)
  ).toBeVisible({ timeout: 20000 });
}

// ============================================================
// Storefront
// ============================================================
test.describe("Storefront", () => {
  test("loads the hero section with store content", async ({ page }) => {
    await waitForStorefront(page);

    // Hero should show the main headline
    await expect(page.getByText("Fresh Products.").first()).toBeVisible({ timeout: 5000 });

    // Shop Now CTA should exist
    await expect(page.getByRole("button", { name: /shop now/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test("displays product categories", async ({ page }) => {
    await waitForStorefront(page);

    // Category bar should contain "All Products" chip (use .first() to avoid footer duplicate)
    await expect(
      page.getByRole("button", { name: "All Products" }).first()
    ).toBeVisible({ timeout: 5000 });

    // Seeded categories should show up
    await expect(
      page.getByRole("button", { name: "Beverages" }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("displays products in the grid", async ({ page }) => {
    await waitForStorefront(page);

    // At least one "Add to Cart" text button is rendered
    await expect(page.getByText("Add to Cart").first()).toBeVisible({ timeout: 5000 });
  });

  test("search filters products", async ({ page }) => {
    await waitForStorefront(page);

    // Find the search input
    const searchInput = page.getByPlaceholder(/search for products/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    await searchInput.fill("Harpic");
    // Wait for debounce (250ms) + fetch
    await page.waitForTimeout(1200);

    // Should show "Harpic" as a product name in the results
    await expect(page.getByText("Harpic").first()).toBeVisible({ timeout: 5000 });
  });

  test("category filter works", async ({ page }) => {
    await waitForStorefront(page);

    // Click a category chip (use .first() to avoid footer link duplicate)
    const categoryBtn = page.getByRole("button", { name: "Beverages" }).first();
    await expect(categoryBtn).toBeVisible({ timeout: 5000 });
    await categoryBtn.click();

    // Wait for products to reload
    await page.waitForTimeout(1200);

    // Products display should update
    await expect(page.getByText(/\d+ products? found/)).toBeVisible({ timeout: 5000 });
  });

  test("product modal opens on card click", async ({ page }) => {
    await waitForStorefront(page);

    // Click a product name to open the modal
    const productName = page.locator("h3.line-clamp-2").first();
    await expect(productName).toBeVisible({ timeout: 5000 });
    await productName.click();

    // Product modal (Dialog) should appear
    await expect(page.getByRole("dialog").first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================
// Cart
// ============================================================
test.describe("Cart", () => {
  test("add to cart and verify badge count", async ({ page }) => {
    await waitForStorefront(page);

    // Click first "Add to Cart" button by text content
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
    await addToCartBtn.click();

    // Sonner toast should confirm
    await expect(page.getByText("Added to cart")).toBeVisible({ timeout: 5000 });

    // Cart button's aria-label should update to show 1 item
    await expect(page.getByLabel(/cart with 1/i)).toBeVisible({ timeout: 5000 });
  });

  test("cart drawer opens and shows items", async ({ page }) => {
    await waitForStorefront(page);

    // Add a product to cart
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
    await addToCartBtn.click();
    await page.waitForTimeout(800);

    // Click the cart button
    const cartBtn = page.getByLabel(/cart with/i).first();
    await expect(cartBtn).toBeVisible({ timeout: 5000 });
    await cartBtn.click();

    // Cart drawer should show
    await expect(page.getByText("Shopping Cart").first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================
// Admin
// ============================================================
test.describe("Admin Login", () => {
  test("navigates to admin and shows login prompt", async ({ page }) => {
    await waitForStorefront(page);

    // Click Admin button (aria-label="Open admin panel")
    const adminBtn = page.getByLabel("Open admin panel").first();
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await adminBtn.click();

    // Should show the admin access-required page
    await expect(
      page.getByText("Admin access required").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("logs in with correct password", async ({ page }) => {
    await waitForStorefront(page);

    // Click Admin button
    const adminBtn = page.getByLabel("Open admin panel").first();
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await adminBtn.click();

    // Click "Sign In"
    const signInBtn = page.getByRole("button", { name: /Sign In/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 10000 });
    await signInBtn.click();

    // Login dialog should be open
    await expect(page.getByText("Admin Login")).toBeVisible({ timeout: 5000 });

    // Enter password — use role selector with .first() to avoid matching the show-password button
    const passwordInput = page.getByRole("textbox", { name: /password/i });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill(ADMIN_PASSWORD);

    // Click Login button (use text selector)
    const loginBtn = page.locator('button:has-text("Login"):not([aria-label])').last();
    await loginBtn.click();

    // Should show admin dashboard
    await expect(page.getByText("Dashboard").first()).toBeVisible({ timeout: 10000 });
  });

  test("shows error on wrong password", async ({ page }) => {
    await waitForStorefront(page);

    // Navigate to admin
    const adminBtn = page.getByLabel("Open admin panel").first();
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await adminBtn.click();

    // Sign In
    const signInBtn = page.getByRole("button", { name: /Sign In/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 10000 });
    await signInBtn.click();

    // Enter wrong password
    const passwordInput = page.getByRole("textbox", { name: /password/i });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill("wrongpassword");

    // Click Login
    const loginBtn = page.locator('button:has-text("Login"):not([aria-label])').last();
    await loginBtn.click();

    // Should show error toast
    await expect(page.getByText("Invalid password")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each admin test
    await waitForStorefront(page);

    // Navigate to admin
    const adminBtn = page.getByLabel("Open admin panel").first();
    await adminBtn.click();

    // Sign In
    const signInBtn = page.getByRole("button", { name: /Sign In/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 10000 });
    await signInBtn.click();

    // Enter password
    const passwordInput = page.getByRole("textbox", { name: /password/i });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill(ADMIN_PASSWORD);

    // Click Login
    const loginBtn = page.locator('button:has-text("Login"):not([aria-label])').last();
    await loginBtn.click();

    // Wait for dashboard to load
    await expect(page.getByText("Dashboard").first()).toBeVisible({ timeout: 10000 });
  });

  test("shows welcome banner and sidebar navigation", async ({ page }) => {
    await expect(page.getByText(/welcome/i).first()).toBeVisible({ timeout: 5000 });

    // Sidebar nav buttons (all in a <nav aria-label="Admin navigation">)
    const sidebar = page.getByRole("navigation", { name: "Admin navigation" });
    await expect(sidebar.getByRole("button", { name: /^Dashboard$/ })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: /^Products$/ })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: /^Categories$/ })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: /^Orders$/ })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: /^Settings$/ })).toBeVisible();
  });

  test("can navigate to products manager", async ({ page }) => {
    const sidebar = page.getByRole("navigation", { name: "Admin navigation" });
    await sidebar.getByRole("button", { name: /^Products$/ }).click();

    await expect(
      page.getByRole("button", { name: /Add Product/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("can navigate to categories manager", async ({ page }) => {
    const sidebar = page.getByRole("navigation", { name: "Admin navigation" });
    await sidebar.getByRole("button", { name: /^Categories$/ }).click();

    await expect(page.getByText("Beverages").first()).toBeVisible({ timeout: 5000 });
  });

  test("can navigate to orders manager", async ({ page }) => {
    const sidebar = page.getByRole("navigation", { name: "Admin navigation" });
    await sidebar.getByRole("button", { name: /^Orders$/ }).click();

    await expect(page.getByText("Total").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Pending").first()).toBeVisible({ timeout: 5000 });
  });

  test("can navigate to settings", async ({ page }) => {
    const sidebar = page.getByRole("navigation", { name: "Admin navigation" });
    await sidebar.getByRole("button", { name: /^Settings$/ }).click();

    await expect(page.getByText("Store Identity").first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================
// Checkout
// ============================================================
test.describe("Checkout", () => {
  test("can open checkout modal", async ({ page }) => {
    await waitForStorefront(page);

    // Add a product to cart
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
    await addToCartBtn.click();
    await page.waitForTimeout(800);

    // Open cart drawer
    const cartBtn = page.getByLabel(/cart with/i).first();
    await expect(cartBtn).toBeVisible({ timeout: 5000 });
    await cartBtn.click();
    await page.waitForTimeout(600);

    // Click "Proceed to Checkout"
    const checkoutBtn = page.getByRole("button", { name: /proceed to checkout/i });
    if (await checkoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkoutBtn.click();
    }

    // Checkout modal should open
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
  });
});
