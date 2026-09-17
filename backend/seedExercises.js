const db = require("./config/mysql");

const exercises = [
  // ================= CHEST =================
  { name: "Push Ups", category: "chest", met: 8, imageUrl: "https://plus.unsplash.com/premium_photo-1663040268906-5ddcfa26cfbd?w=900" },
  { name: "Bench Press", category: "chest", met: 6, imageUrl: "https://images.unsplash.com/photo-1652363722833-509b3aac287b?w=900" },
  { name: "Chest Fly", category: "chest", met: 5, imageUrl: "https://images.unsplash.com/photo-1646072507459-bc2408ec124a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hlc3QlMjBmbHl8ZW58MHx8MHx8fDA%3D" },

  // ================= BACK =================
  { name: "Deadlift", category: "back", met: 9, imageUrl: "https://images.unsplash.com/photo-1534368270820-9de3d8053204?w=900" },
  { name: "Pull Ups", category: "back", met: 8, imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900" },
  { name: "Lat Pulldown", category: "back", met: 6, imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=900" },

  // ================= LEGS =================
  { name: "Squats", category: "legs", met: 8, imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900" },
  { name: "Lunges", category: "legs", met: 7, imageUrl: "https://images.unsplash.com/photo-1650116385006-2a82a7b9941b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHVuZ2VzfGVufDB8fDB8fHww" },
  { name: "Leg Press", category: "legs", met: 6, imageUrl: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=900" },

  // ================= SHOULDERS =================
  { name: "Shoulder Press", category: "shoulders", met: 6, imageUrl: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=900" },
  { name: "Lateral Raise", category: "shoulders", met: 5, imageUrl: "https://images.unsplash.com/photo-1750698544726-8bc312ac1ffd?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },

  // ================= BICEPS =================
  { name: "Bicep Curl", category: "biceps", met: 5, imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=900" },
  { name: "Hammer Curl", category: "biceps", met: 5, imageUrl: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=900" },

  // ================= TRICEPS =================
  { name: "Tricep Dips", category: "triceps", met: 6, imageUrl: "https://plus.unsplash.com/premium_photo-1679635697473-a9f7464e3e26?w=900" },
  { name: "Tricep Pushdown", category: "triceps", met: 5, imageUrl: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=900" },

  // ================= ABS =================
  { name: "Plank", category: "abs", met: 4, imageUrl: "https://plus.unsplash.com/premium_photo-1672046218182-77e9a3e9f141?w=900" },
  { name: "Crunches", category: "abs", met: 5, imageUrl: "https://images.unsplash.com/photo-1616803824305-a07cfbc8ea60?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3J1bmNoZXN8ZW58MHx8MHx8fDA%3D" },

  // ================= CARDIO =================
  { name: "Running", category: "cardio", met: 10, imageUrl: "https://images.unsplash.com/photo-1727094141271-9bea5bc8c757?w=900" },
  { name: "Jump Rope", category: "cardio", met: 12, imageUrl: "https://images.unsplash.com/photo-1686247074183-151c7397017a?w=900" },
  { name: "Cycling", category: "cardio", met: 9, imageUrl: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=900" }
];

const seedExercises = async () => {
  try {
    for (const ex of exercises) {

      // prevent duplicates
      const [existing] = await db.promise().query(
        "SELECT id FROM exercises WHERE name = ?",
        [ex.name]
      );

      if (existing.length > 0) continue;

      await db.promise().query(
        `INSERT INTO exercises (name, category, met, imageUrl)
         VALUES (?, ?, ?, ?)`,
        [ex.name, ex.category, ex.met, ex.imageUrl]
      );
    }

    console.log("🔥 ALL EXERCISES SEEDED SUCCESSFULLY");
    process.exit();

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seedExercises();