const dns = require('dns');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Food = require('../models/Food');

dotenv.config();

const dnsServers = (process.env.MONGO_DNS_SERVERS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
  console.log(`Using custom DNS servers for MongoDB SRV lookup: ${dnsServers.join(', ')}`);
}

const foods = [
  // Indian staples
  { name: 'White Rice (cooked)', per100gCalories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  { name: 'Brown Rice (cooked)', per100gCalories: 123, protein: 2.7, carbs: 25.6, fat: 1.0, fiber: 1.8 },
  { name: 'Roti / Chapati', per100gCalories: 297, protein: 10.2, carbs: 53.4, fat: 4.0, fiber: 3.0 },
  { name: 'Idli', per100gCalories: 58, protein: 2.0, carbs: 12.0, fat: 0.1, fiber: 0.5 },
  { name: 'Dosa', per100gCalories: 168, protein: 3.6, carbs: 24.0, fat: 5.0, fiber: 0.6 },
  { name: 'Upma', per100gCalories: 163, protein: 3.5, carbs: 26.0, fat: 5.5, fiber: 1.5 },
  { name: 'Poha', per100gCalories: 130, protein: 2.5, carbs: 27.0, fat: 1.0, fiber: 0.8 },
  { name: 'Dal (cooked)', per100gCalories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 4.5 },
  { name: 'Rajma (cooked)', per100gCalories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 7.4 },
  { name: 'Chana Dal (cooked)', per100gCalories: 164, protein: 11.0, carbs: 27.0, fat: 2.0, fiber: 6.0 },
  { name: 'Sambar', per100gCalories: 56, protein: 3.0, carbs: 8.0, fat: 1.5, fiber: 2.0 },
  { name: 'Curd / Yogurt', per100gCalories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0.0 },
  { name: 'Paneer', per100gCalories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0.0 },
  { name: 'Egg (boiled)', per100gCalories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0.0 },
  { name: 'Chicken Breast (cooked)', per100gCalories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0 },
  { name: 'Fish (grilled)', per100gCalories: 136, protein: 26.0, carbs: 0.0, fat: 3.0, fiber: 0.0 },
  { name: 'Milk (full fat)', per100gCalories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0.0 },
  { name: 'Banana', per100gCalories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  { name: 'Apple', per100gCalories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  { name: 'Mango', per100gCalories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6 },
  { name: 'Orange', per100gCalories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4 },
  { name: 'Watermelon', per100gCalories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4 },
  { name: 'Papaya', per100gCalories: 43, protein: 0.5, carbs: 11.0, fat: 0.3, fiber: 1.7 },
  { name: 'Pineapple', per100gCalories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4 },
  { name: 'Grapes', per100gCalories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9 },
  { name: 'Potato (boiled)', per100gCalories: 87, protein: 1.9, carbs: 20.1, fat: 0.1, fiber: 1.8 },
  { name: 'Sweet Potato (boiled)', per100gCalories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0 },
  { name: 'Spinach (cooked)', per100gCalories: 23, protein: 3.0, carbs: 3.6, fat: 0.4, fiber: 2.4 },
  { name: 'Tomato', per100gCalories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { name: 'Onion', per100gCalories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  { name: 'Oats (cooked)', per100gCalories: 71, protein: 2.5, carbs: 12.0, fat: 1.5, fiber: 1.8 },
  { name: 'Bread (white)', per100gCalories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, fiber: 2.7 },
  { name: 'Whole Wheat Bread', per100gCalories: 247, protein: 10.7, carbs: 43.1, fat: 3.4, fiber: 6.9 },
  { name: 'Peanut Butter', per100gCalories: 588, protein: 25.0, carbs: 20.0, fat: 50.0, fiber: 6.0 },
  { name: 'Almonds', per100gCalories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 },
  { name: 'Walnuts', per100gCalories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 },
  { name: 'Cashews', per100gCalories: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fiber: 3.3 },
  { name: 'Coconut (fresh)', per100gCalories: 354, protein: 3.3, carbs: 15.2, fat: 33.5, fiber: 9.0 },
  { name: 'Ghee', per100gCalories: 900, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0 },
  { name: 'Vegetable Oil', per100gCalories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0 },
  // International
  { name: 'Pizza (cheese)', per100gCalories: 266, protein: 11.0, carbs: 33.0, fat: 10.0, fiber: 2.3 },
  { name: 'Burger (beef)', per100gCalories: 295, protein: 17.0, carbs: 24.0, fat: 14.0, fiber: 1.3 },
  { name: 'Pasta (cooked)', per100gCalories: 158, protein: 5.8, carbs: 31.0, fat: 0.9, fiber: 1.8 },
  { name: 'Noodles (cooked)', per100gCalories: 138, protein: 4.5, carbs: 25.1, fat: 2.1, fiber: 1.5 },
  { name: 'Sandwich (veg)', per100gCalories: 200, protein: 7.0, carbs: 34.0, fat: 5.0, fiber: 3.0 },
  { name: 'Salad (green, no dress)', per100gCalories: 15, protein: 1.3, carbs: 2.9, fat: 0.2, fiber: 1.9 },
  { name: 'Soup (chicken)', per100gCalories: 40, protein: 4.0, carbs: 3.5, fat: 1.0, fiber: 0.5 },
  { name: 'Orange Juice', per100gCalories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, fiber: 0.2 },
  { name: 'Coffee (black)', per100gCalories: 2, protein: 0.3, carbs: 0.0, fat: 0.0, fiber: 0.0 },
  { name: 'Tea (with milk)', per100gCalories: 18, protein: 1.0, carbs: 2.0, fat: 0.5, fiber: 0.0 },
  { name: 'Protein Shake', per100gCalories: 120, protein: 24.0, carbs: 5.0, fat: 2.0, fiber: 1.0 },
];

async function seedFoods() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    await Food.deleteMany({});
    await Food.insertMany(foods);
    console.log(`✅ Seeded ${foods.length} food items`);
    process.exit(0);
  } catch (err) {
    if (err.code === 'ETIMEOUT' && String(err.message).includes('querySrv')) {
      console.error('Tip: set MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1 in server/.env and retry.');
    }
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seedFoods();
