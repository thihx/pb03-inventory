import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDb = path.join(__dirname, '..', 'data', 'test.db');
process.env.DB_PATH = testDb;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

if (fs.existsSync(testDb)) fs.unlinkSync(testDb);

const { db, migrate } = await import('../src/db.js');
migrate();
db.prepare(
  `INSERT INTO users (username, password_hash, role, display_name) VALUES
   ('manager', ?, 'WAREHOUSE_MANAGER', 'Mgr'),
   ('clerk', ?, 'WAREHOUSE_CLERK', 'Clk')`
).run(bcrypt.hashSync('Manager@123', 4), bcrypt.hashSync('Clerk@123', 4));
db.prepare(
  `INSERT INTO products (sku, name, unit, min_stock, quantity_on_hand, unit_cost, active)
   VALUES ('SKU-T1', 'Test Item', 'pcs', 5, 0, 1000, 1)`
).run();

const { app } = await import('../src/index.js');

function request(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const { port } = server.address();
      try {
        const res = await fetch(`http://127.0.0.1:${port}${url}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { json = text; }
        resolve({ status: res.status, body: json });
      } catch (e) {
        reject(e);
      } finally {
        server.close();
      }
    });
  });
}

describe('PB-03 inventory API', () => {
  let managerToken;
  let clerkToken;
  let productId;

  before(async () => {
    const m = await request('POST', '/api/auth/login', { username: 'manager', password: 'Manager@123' });
    const c = await request('POST', '/api/auth/login', { username: 'clerk', password: 'Clerk@123' });
    assert.equal(m.status, 200);
    assert.equal(c.status, 200);
    managerToken = m.body.token;
    clerkToken = c.body.token;
    const products = await request('GET', '/api/products', null, clerkToken);
    productId = products.body[0].id;
  });

  it('US-02: clerk cannot create product (403)', async () => {
    const res = await request('POST', '/api/products', { sku: 'X', name: 'X' }, clerkToken);
    assert.equal(res.status, 403);
  });

  it('US-03: stock in increases qty', async () => {
    const res = await request('POST', '/api/vouchers/in', {
      lines: [{ product_id: productId, qty: 10 }],
      note: 'seed in',
    }, clerkToken);
    assert.equal(res.status, 201);
    const stock = await request('GET', '/api/stock', null, clerkToken);
    const row = stock.body.find((p) => p.id === productId);
    assert.equal(row.quantity_on_hand, 10);
  });

  it('US-04: stock out beyond on-hand returns 409 and qty unchanged', async () => {
    const before = await request('GET', '/api/stock', null, clerkToken);
    const qtyBefore = before.body.find((p) => p.id === productId).quantity_on_hand;
    const res = await request('POST', '/api/vouchers/out', {
      lines: [{ product_id: productId, qty: qtyBefore + 5 }],
    }, clerkToken);
    assert.equal(res.status, 409);
    const after = await request('GET', '/api/stock', null, clerkToken);
    assert.equal(after.body.find((p) => p.id === productId).quantity_on_hand, qtyBefore);
  });

  it('US-05: clerk cannot approve adjust (403); manager can', async () => {
    const created = await request('POST', '/api/vouchers/adjust', {
      lines: [{ product_id: productId, delta: -1 }],
      note: 'lost',
    }, clerkToken);
    assert.equal(created.status, 201);
    const denied = await request('POST', `/api/vouchers/adjust/${created.body.id}/approve`, {}, clerkToken);
    assert.equal(denied.status, 403);
    const ok = await request('POST', `/api/vouchers/adjust/${created.body.id}/approve`, {}, managerToken);
    assert.equal(ok.status, 200);
  });

  it('US-07: clerk report has no closing_value', async () => {
    const clerkReport = await request('GET', '/api/reports/nxt', null, clerkToken);
    assert.equal(clerkReport.status, 200);
    assert.equal(clerkReport.body.rows[0].closing_value, undefined);
    const mgrReport = await request('GET', '/api/reports/nxt', null, managerToken);
    assert.ok('closing_value' in mgrReport.body.rows[0]);
  });
});
