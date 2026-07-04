import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Seed route - initializes store settings, categories, and demo products
export async function POST(_req: NextRequest) {
  // Settings
  const settings = await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  // Categories
  const categories = [
    { name: "Groceries", icon: "ShoppingBasket", description: "Daily essential groceries" },
    { name: "Beverages", icon: "CupSoda", description: "Tea, coffee, juices & soft drinks" },
    { name: "Snacks", icon: "Cookie", description: "Chips, biscuits & namkeen" },
    { name: "Dairy", icon: "Milk", description: "Milk, paneer, curd & dairy products" },
    { name: "Personal Care", icon: "Sparkles", description: "Soap, shampoo & hygiene" },
    { name: "Home Care", icon: "Home", description: "Cleaning & household items" },
  ];

  for (const c of categories) {
    await db.category.upsert({
      where: { name: c.name },
      update: { icon: c.icon, description: c.description },
      create: c,
    });
  }

  // Demo products
  const existingProducts = await db.product.count();
  if (existingProducts === 0) {
    const demo = [
      { name: "Aashirvaad Atta 5kg", description: "Premium whole wheat flour for soft chapatis. Stone-ground, rich in fiber.", price: 245, originalPrice: 270, category: "Groceries", unit: "pack", brand: "Aashirvaad", stock: 40, featured: true, rating: 4.5 },
      { name: "Tata Salt 1kg", description: "Iodised table salt for everyday cooking. Pure and free-flowing.", price: 28, originalPrice: 30, category: "Groceries", unit: "pack", brand: "Tata", stock: 100, featured: false, rating: 4.7 },
      { name: "Fortune Sunflower Oil 1L", description: "Refined sunflower oil with Vitamin A & D. Light and healthy.", price: 145, originalPrice: 160, category: "Groceries", unit: "bottle", brand: "Fortune", stock: 60, featured: true, rating: 4.4 },
      { name: "Saffola Gold Oil 1L", description: "Blended rice bran & sunflower oil for heart health.", price: 195, category: "Groceries", unit: "bottle", brand: "Saffola", stock: 35, rating: 4.6 },
      { name: "Coca-Cola 750ml", description: "Refreshing chilled soft drink. Best served cold.", price: 42, originalPrice: 45, category: "Beverages", unit: "bottle", brand: "Coca-Cola", stock: 80, featured: true, rating: 4.3 },
      { name: "Tata Tea Premium 500g", description: "Strong & refreshing premium tea. A perfect morning cup.", price: 135, originalPrice: 145, category: "Beverages", unit: "pack", brand: "Tata", stock: 50, featured: false, rating: 4.5 },
      { name: "Nescafe Classic Coffee 100g", description: "Instant coffee rich in aroma and taste.", price: 165, category: "Beverages", unit: "jar", brand: "Nescafe", stock: 45, rating: 4.6 },
      { name: "Lay's Magic Masala 52g", description: "Crunchy potato chips with tangy masala flavor.", price: 20, originalPrice: 22, category: "Snacks", unit: "pack", brand: "Lay's", stock: 120, featured: true, rating: 4.4 },
      { name: "Parle-G Biscuit 800g", description: "Classic glucose biscuits. Loved by all ages.", price: 80, category: "Snacks", unit: "pack", brand: "Parle", stock: 70, featured: false, rating: 4.5 },
      { name: "Haldiram's Aloo Bhujia 400g", description: "Crunchy spicy bhujia made from potato & gram flour.", price: 110, originalPrice: 120, category: "Snacks", unit: "pack", brand: "Haldiram's", stock: 55, featured: true, rating: 4.6 },
      { name: "Amul Taaza Milk 500ml", description: "Toned pasteurized milk. Fresh and full of nutrition.", price: 28, category: "Dairy", unit: "pouch", brand: "Amul", stock: 90, featured: false, rating: 4.7 },
      { name: "Amul Paneer 200g", description: "Soft fresh cottage paneer, rich in protein.", price: 95, originalPrice: 100, category: "Dairy", unit: "pack", brand: "Amul", stock: 30, featured: true, rating: 4.5 },
      { name: "Amul Butter 500g", description: "Pasteurized salted butter. Creamy and delicious.", price: 265, category: "Dairy", unit: "pack", brand: "Amul", stock: 25, rating: 4.8 },
      { name: "Dettol Soap 75g (x3)", description: "Antibacterial bathing soap. Protects from germs.", price: 90, originalPrice: 105, category: "Personal Care", unit: "pack", brand: "Dettol", stock: 65, featured: false, rating: 4.5 },
      { name: "Colgate Toothpaste 200g", description: "Strong teeth & fresh breath toothpaste with fluoride.", price: 115, category: "Personal Care", unit: "tube", brand: "Colgate", stock: 75, featured: true, rating: 4.6 },
      { name: "Surf Excel Detergent 1kg", description: "Powerful stain removal detergent powder.", price: 145, originalPrice: 165, category: "Home Care", unit: "pack", brand: "Surf Excel", stock: 50, featured: false, rating: 4.4 },
      { name: "Vim Dishwash Bar 300g", description: "Removes tough grease with the power of 100 lemons.", price: 30, category: "Home Care", unit: "bar", brand: "Vim", stock: 110, featured: true, rating: 4.5 },
      { name: "Harpic Toilet Cleaner 1L", description: "Kills 99.9% germs and removes stains.", price: 99, originalPrice: 110, category: "Home Care", unit: "bottle", brand: "Harpic", stock: 40, rating: 4.5 },
    ];

    for (const p of demo) {
      await db.product.create({
        data: {
          ...p,
          images: JSON.stringify([]),
        },
      });
    }
  }

  return NextResponse.json({
    success: true,
    settings,
    message: "Store seeded successfully",
  });
}
