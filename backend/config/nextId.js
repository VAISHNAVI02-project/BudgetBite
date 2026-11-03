// TiDB schema currently has INT PRIMARY KEY columns without AUTO_INCREMENT.
// Keep table names restricted to this allowlist; values are never interpolated.
const TABLES = new Set([
  'addresses', 'categories', 'combo_items', 'combos', 'foods',
  'order_items', 'orders', 'reviews', 'users'
]);

async function getNextId(db, table) {
  if (!TABLES.has(table)) throw new Error(`Unsupported ID table: ${table}`);
  const [rows] = await db.query(
    `SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM ${table}`
  );
  return Number(rows[0].nextId);
}

module.exports = getNextId;
