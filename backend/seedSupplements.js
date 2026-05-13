const db = require("./config/mysql");

console.log("🔥 SUPPLEMENT SEED STARTED");

const supplements = [
  {
    name: "Optimum Nutrition Gold Whey",
    category: "protein",
    brand: "Optimum Nutrition",
    price: 4999,
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIconW1MSwgHK0praSH0Q3A9Mwy6qVaY9RDA&s",
    buyLink: "https://www.optimumnutrition.co.in/products"
  },
  {
    name: "MuscleBlaze Whey Protein",
    category: "protein",
    brand: "MuscleBlaze",
    price: 2999,
    imageUrl: "https://m.media-amazon.com/images/I/41oXkxW3tBL.jpg",
    buyLink: "https://www.muscleblaze.com/"
  },
  {
    name: "Creatine Monohydrate",
    category: "creatine",
    brand: "BigMuscles",
    price: 1499,
    imageUrl: "https://m.media-amazon.com/images/I/51OspIEO9KL.jpg",
    buyLink: "https://www.amazon.in/"
  },
  {
    name: "C4 Pre Workout",
    category: "pre_workout",
    brand: "Cellucor",
    price: 1999,
    imageUrl: "https://m.media-amazon.com/images/I/71xfX1EiXkL.jpg",
    buyLink: "https://www.cellucor.com/"
  },
  {
    name: "Multivitamin Tablets",
    category: "vitamins",
    brand: "HealthKart",
    price: 799,
    imageUrl: "https://img8.hkrtcdn.com/40247/prd_4024657.jpg",
    buyLink: "https://www.healthkart.com/"
  },
  {
    name: "Fish Oil Omega 3",
    category: "omega_3",
    brand: "HealthKart",
    price: 999,
    imageUrl: "https://img6.hkrtcdn.com/41657/prd_4165635.jpg",
    buyLink: "https://www.hkvitals.com/"
  }
];

const seedSupplements = async () => {
  try {
    for (const s of supplements) {

      const [existing] = await db.promise().query(
        "SELECT id FROM supplements WHERE name = ?",
        [s.name]
      );

      if (existing.length > 0) continue;

      await db.promise().query(
        `INSERT INTO supplements
        (name, category, brand, price, imageUrl, buyLink)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          s.name,
          s.category,
          s.brand,
          s.price,
          s.imageUrl,
          s.buyLink
        ]
      );
    }

    console.log("🔥 SUPPLEMENTS SEEDED SUCCESSFULLY");
    process.exit();

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seedSupplements();