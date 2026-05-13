const db = require("./config/mysql");

console.log("🔥 FOOD SEED STARTED");

const foods = [
  { name: "Chicken Breast", category: "protein", imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=687", calories: 165, protein: 31, carbs: 0, fats: 3.6 },

  { name: "Egg", category: "protein", imageUrl: "https://images.unsplash.com/photo-1607690424560-35d967d6ad7c?w=600", calories: 155, protein: 13, carbs: 1, fats: 11 },

  { name: "Fish", category: "protein", imageUrl: "https://images.unsplash.com/photo-1535443120147-89aef0b5327a?w=600", calories: 206, protein: 22, carbs: 0, fats: 12 },

  { name: "Dal", category: "protein", imageUrl: "https://plus.unsplash.com/premium_photo-1701064865147-48dcd4d63015?w=600", calories: 116, protein: 9, carbs: 20, fats: 0.4 },

  { name: "Milk", category: "dairy", imageUrl: "https://plus.unsplash.com/premium_photo-1694481100261-ab16523c4093?w=600", calories: 60, protein: 3.2, carbs: 5, fats: 3.3 },

  { name: "Paneer", category: "dairy", imageUrl: "https://images.unsplash.com/photo-1630748661719-875c3b7ebfb7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBhbmVlcnxlbnwwfHwwfHx8MA%3D%3D", calories: 265, protein: 18, carbs: 1.2, fats: 20 },

  { name: "Rice", category: "grains", imageUrl: "https://plus.unsplash.com/premium_photo-1675814316651-3ce3c6409922?w=600", calories: 130, protein: 2.5, carbs: 28, fats: 0.3 },

  { name: "Chapati", category: "grains", imageUrl: "https://images.unsplash.com/photo-1633442496018-6872fbfbbcc7?w=600", calories: 120, protein: 3, carbs: 20, fats: 3 },

  { name: "Apple", category: "fruits", imageUrl: "https://plus.unsplash.com/premium_photo-1724249990837-f6dfcb7f3eaa?w=600", calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },

  { name: "Banana", category: "fruits", imageUrl: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600", calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },

  { name: "Broccoli", category: "vegetables", imageUrl: "https://images.unsplash.com/photo-1685504445355-0e7bdf90d415?w=600", calories: 55, protein: 3.7, carbs: 11, fats: 0.6 },

  { name: "Potato", category: "vegetables", imageUrl: "https://plus.unsplash.com/premium_photo-1724256031338-b5bfba816cfd?w=600", calories: 77, protein: 2, carbs: 17, fats: 0.1 },

  { name: "Almonds", category: "nuts_seeds", imageUrl: "https://plus.unsplash.com/premium_photo-1675237625910-e5d354c03987?w=600", calories: 579, protein: 21, carbs: 22, fats: 50 },

  { name: "Burger", category: "fast_food", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600", calories: 295, protein: 17, carbs: 30, fats: 12 },

  { name: "Pizza", category: "fast_food", imageUrl: "https://plus.unsplash.com/premium_photo-1673439304183-8840bd0dc1bf?w=600", calories: 266, protein: 11, carbs: 33, fats: 10 }
];

const seedFoods = async () => {
  try {
    for (const food of foods) {

      // prevent duplicates
      const [existing] = await db.promise().query(
        "SELECT id FROM foods WHERE name = ?",
        [food.name]
      );

      if (existing.length > 0) continue;

      await db.promise().query(
        `INSERT INTO foods
        (name, calories, protein, carbs, fats, imageUrl, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          food.name,
          food.calories,
          food.protein,
          food.carbs,
          food.fats,
          food.imageUrl,
          food.category
        ]
      );
    }

    console.log("🔥 FOODS SEEDED SUCCESSFULLY");
    process.exit();

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seedFoods();