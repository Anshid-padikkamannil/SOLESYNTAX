require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/productSchema");

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const products = await Product.find().sort({ createdAt: 1 });

    for (let i = 0; i < products.length; i++) {

      const imageNumber = (i % 16) + 1;

      // Always overwrite
      products[i].images = [`/images/item-${imageNumber}.jpg`];

      await products[i].save();
    }

    console.log("✅ Images updated successfully!");

    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateImages();