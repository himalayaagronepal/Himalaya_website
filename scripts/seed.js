const dotenv = require("dotenv");
// prefer .env.local (what Next.js uses) but fall back to .env for CLI
dotenv.config({ path: ".env.local" });
dotenv.config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI missing in env");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("Connected to MongoDB for seeding");

  const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'user' } }, { timestamps: true });
  const productSchema = new mongoose.Schema({ name: String, description: String, brand: String, price: Number, category: String, images: [String], stock: Number, isActive: Boolean }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

  const demoEmail = process.env.SEED_ADMIN_EMAIL || 'user@example.com';
  const demoPassword = process.env.SEED_ADMIN_PASSWORD || 'password123';

  const hashed = await bcrypt.hash(demoPassword, 10);
  await User.updateOne({ email: demoEmail }, { $set: { name: 'Demo User', email: demoEmail, password: hashed, role: 'user' } }, { upsert: true });
  console.log(`Upserted demo user -> ${demoEmail} / ${demoPassword}`);

  // upsert demo product and capture docs so categories can reference them
  const demo = await Product.findOneAndUpdate(
    { name: 'Demo Product' },
    {
      $set: {
        name: 'Demo Product',
        description: 'This is a seeded demo product.',
        brand: 'DemoBrand',
        price: 19.99,
        category: 'demo',
        images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
        stock: 100,
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Upserted demo product');

  // additional demo products (capture results)
  const seedProducts = [
    {
      name: 'Blue T-Shirt',
      description: 'Comfortable cotton t-shirt.',
      brand: 'Acme Apparel',
      price: 24.99,
      category: 'clothing',
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      stock: 50,
      isActive: true,
    },
    {
      name: 'Stainless Water Bottle',
      description: 'Keeps drinks cold for 24 hours.',
      brand: 'HydroCorp',
      price: 29.99,
      category: 'accessories',
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      stock: 200,
      isActive: true,
    },
    {
      name: 'Cauliflower (seed)',
      description: 'Seeded cauliflower product for "flower" category example.',
      brand: 'Seed Co.',
      price: 3.5,
      category: 'flower',
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      stock: 500,
      isActive: true,
    }
  ];

  const created = [];
  for (const p of seedProducts) {
    const doc = await Product.findOneAndUpdate({ name: p.name }, { $set: p }, { upsert: true, new: true, setDefaultsOnInsert: true });
    created.push(doc);
    console.log(`Upserted product: ${p.name}`);
  }

  // upsert categories and attach product ids
  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({ name: String, products: [mongoose.Schema.Types.ObjectId] }));
  const categoriesToCreate = [
    { name: 'demo', products: [demo._id] },
    { name: 'clothing', products: created.filter((c) => c.category === 'clothing').map((c) => c._id) },
    { name: 'accessories', products: created.filter((c) => c.category === 'accessories').map((c) => c._id) },
    { name: 'flower', products: created.filter((c) => c.category === 'flower').map((c) => c._id) },
  ];

  for (const cat of categoriesToCreate) {
    await Category.updateOne({ name: cat.name }, { $set: { name: cat.name, products: cat.products } }, { upsert: true });
    console.log(`Upserted category: ${cat.name}`);
  }

  await mongoose.disconnect();
  console.log('Seed finished');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});