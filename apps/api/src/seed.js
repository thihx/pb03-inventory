import bcrypt from 'bcryptjs';
import { db, migrate } from './db.js';

migrate();

const upsertUser = db.prepare(`
  INSERT INTO users (username, password_hash, role, display_name)
  VALUES (@username, @password_hash, @role, @display_name)
  ON CONFLICT(username) DO UPDATE SET
    password_hash=excluded.password_hash,
    role=excluded.role,
    display_name=excluded.display_name
`);

const countProducts = db.prepare('SELECT COUNT(*) AS c FROM products');

upsertUser.run({
  username: 'manager',
  password_hash: bcrypt.hashSync('Manager@123', 8),
  role: 'WAREHOUSE_MANAGER',
  display_name: 'Nguyen Quan Ly',
});

upsertUser.run({
  username: 'clerk',
  password_hash: bcrypt.hashSync('Clerk@123', 8),
  role: 'WAREHOUSE_CLERK',
  display_name: 'Tran Thu Kho',
});

if (countProducts.get().c === 0) {
  const insert = db.prepare(`
    INSERT INTO products (sku, name, unit, min_stock, quantity_on_hand, unit_cost, active)
    VALUES (@sku, @name, @unit, @min_stock, @quantity_on_hand, @unit_cost, 1)
  `);
  insert.run({ sku: 'SKU-001', name: 'Thung carton 60x40', unit: 'pcs', min_stock: 20, quantity_on_hand: 0, unit_cost: 15000 });
  insert.run({ sku: 'SKU-002', name: 'Bang keo 48mm', unit: 'cuon', min_stock: 50, quantity_on_hand: 0, unit_cost: 12000 });
  insert.run({ sku: 'SKU-003', name: 'Palet go', unit: 'pcs', min_stock: 10, quantity_on_hand: 0, unit_cost: 250000 });
}

console.log('Seed OK — users: manager/Manager@123, clerk/Clerk@123');
