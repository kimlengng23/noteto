const dotenv = require("dotenv");
const path = require("path");
const dropdowns = require("../seeds/dropdowns.json");
const database = require("../database.js");

dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.development"), override: true });

async function seedDropdowns() {
  const db = await database.createDbConn();
  const collection = db.collection("DropdownCollection");
  const now = new Date();

  await collection.createIndex(
    { dropdown: 1, value: 1 },
    { unique: true, name: "dropdown_value_unique" }
  );

  let inserted = 0;
  let updated = 0;

  for (const option of dropdowns) {
    const result = await collection.updateOne(
      {
        dropdown: option.dropdown,
        value: option.value,
      },
      {
        $set: {
          ...option,
          updatedAt: now,
        },
        $setOnInsert: {
          dateCreated: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) inserted += result.upsertedCount;
    else if (result.modifiedCount > 0) updated += result.modifiedCount;
  }

  console.log(
    `Seeded DropdownCollection: ${inserted} inserted, ${updated} updated, ${dropdowns.length} total options.`
  );
}

seedDropdowns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed dropdowns.");
    console.error(error);
    process.exit(1);
  });
