const db = require("./config/mysql");

console.log("🔥 SUPPLEMENT SEED STARTED");

const supplements = [

  {
    name: "Optimum Nutrition Gold Whey",
    category: "protein",
    brand: "Optimum Nutrition",
    price: 8799,
    imageUrl: "https://m.media-amazon.com/images/I/71Lw7FkgniL._SX679_PIbundle-50,TopRight,0,0_AA679SH20_.jpg",
    buyLink: "https://amzn.in/d/08S8Rd9u"
  },

  {
    name: "MuscleBlaze Whey Protein",
    category: "protein",
    brand: "MuscleBlaze",
    price: 12999,
    imageUrl: "https://m.media-amazon.com/images/I/41KqXtmjv2L._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://www.muscleblaze.com/"
  },

  {
    name: "BigMuscles Whey Protein",
    category: "protein",
    brand: "BigMuscles",
    price: 1700,
    imageUrl: "https://m.media-amazon.com/images/I/71-pslLaS-L._SX679_.jpg",
    buyLink: "https://amzn.in/d/0fzNNzFW"
  },

  {
    name: "Dymatize ISO100",
    category: "protein",
    brand: "Dymatize",
    price: 17999,
    imageUrl: "https://m.media-amazon.com/images/I/51MVJC6nPyL._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://amzn.in/d/0flVehaN"
  },

  {
    name: "MyProtein Impact Whey",
    category: "protein",
    brand: "MyProtein",
    price: 3499,
    imageUrl: "https://m.media-amazon.com/images/I/4104Q2mUrNL._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://amzn.in/d/010K0ibE"
  },

  {
    name: "Creatine Monohydrate",
    category: "creatine",
    brand: "BigMuscles",
    price: 1499,
    imageUrl: "https://m.media-amazon.com/images/I/51OspIEO9KL._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://amzn.in/d/09yzPF7n"
  },

  {
    name: "MuscleBlaze Creatine",
    category: "creatine",
    brand: "MuscleBlaze",
    price: 1299,
    imageUrl: "https://m.media-amazon.com/images/I/41-EA9-WcbL._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://amzn.in/d/05RKLKUG"
  },

  {
    name: "C4 Pre Workout",
    category: "pre_workout",
    brand: "Cellucor",
    price: 1999,
    imageUrl: "https://m.media-amazon.com/images/I/51iTtLeLZPL._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://amzn.in/d/0f2GiWYR"
  },

  {
    name: "ON Pre Workout",
    category: "pre_workout",
    brand: "Optimum Nutrition",
    price: 2299,
    imageUrl: "https://m.media-amazon.com/images/I/71s-RFOOX7L._SX679_PIbundle-2,TopRight,0,0_SX679SY169SH20_.jpg",
    buyLink: "https://amzn.in/d/0i6qfbCH"
  },

  {
    name: "Multivitamin Tablets",
    category: "vitamins",
    brand: "HealthKart",
    price: 799,
    imageUrl: "https://m.media-amazon.com/images/I/7104mbM5fqL._SX679_.jpg",
    buyLink: "https://amzn.in/d/0j7mz0XX"
  },

  {
    name: "Vitamin C Tablets",
    category: "vitamins",
    brand: "Naturaltein Liposomal",
    price: 499,
    imageUrl: "https://m.media-amazon.com/images/I/71pHT8fhIoL._SX679_PIbundle-60,TopRight,0,0_AA679SH20_.jpg",
    buyLink: "https://amzn.in/d/05coYtC4"
  },

  {
    name: "Fish Oil Omega 3",
    category: "omega_3",
    brand: "HK Vitals",
    price: 999,
    imageUrl: "https://m.media-amazon.com/images/I/41Ig5VVwhhL._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://amzn.in/d/02ZeJ523"
  },

  {
    name: "Calcium + D3 Tablets",
    category: "vitamins",
    brand: "HealthKart",
    price: 599,
    imageUrl: "https://m.media-amazon.com/images/I/41dD0cj9YYL._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://amzn.in/d/0fbIZ4if"
  },

  {
    name: "Mass Gainer",
    category: "weight_gain",
    brand: "MuscleBlaze",
    price: 4259,
    imageUrl: "https://m.media-amazon.com/images/I/41OcOaWssqL._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://amzn.in/d/0b8J2OSe"
  },

  {
    name: "BCAA Energy",
    category: "amino_acids",
    brand: "Scivation",
    price: 1899,
    imageUrl: "https://m.media-amazon.com/images/I/41wW9ODtNaL._SY300_SX300_QL70_FMwebp_.jpg",
    buyLink: "https://amzn.in/d/055K8nnE"
  }

];

/* ======================
   🚀 INSERT SEED
====================== */
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

    console.log("🔥 15+ SUPPLEMENTS SEEDED SUCCESSFULLY");
    process.exit();

  } catch (err) {
    console.log("❌ ERROR:", err);
    process.exit(1);
  }
};

seedSupplements();