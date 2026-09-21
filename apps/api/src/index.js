import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, migrate } from './db.js';

migrate();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4003;
const JWT_SECRET = process.env.JWT_SECRET || 'pb03-dev-secret-change-me';
const webDist = path.join(__dirname, '..', '..', 'web', 'dist');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function audit(actorId, action, entity, entityId, detail) {
  db.prepare(
    `INSERT INTO audit_logs (actor_id, action, entity, entity_id, detail_json)
     VALUES (?, ?, ?, ?, ?)`
  ).run(actorId, action, entity, entityId ?? null, detail ? JSON.stringify(detail) : null);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    next();
  };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, project: 'PB-03' }));

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'VALIDATION' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }
  const payload = { id: user.id, username: user.username, role: user.role, display_name: user.display_name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  audit(user.id, 'LOGIN', 'users', user.id, null);
  res.json({ token, user: payload });
});

app.get('/api/products', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT id, sku, name, unit, min_stock, quantity_on_hand, unit_cost, active FROM products ORDER BY sku').all();
  res.json(rows);
});

app.post('/api/products', requireAuth, requireRole('WAREHOUSE_MANAGER'), (req, res) => {
  const { sku, name, unit = 'pcs', min_stock = 0, unit_cost = null } = req.body || {};
  if (!sku || !name) return res.status(400).json({ error: 'VALIDATION' });
  try {
    const info = db.prepare(
      `INSERT INTO products (sku, name, unit, min_stock, quantity_on_hand, unit_cost, active)
       VALUES (?, ?, ?, ?, 0, ?, 1)`
    ).run(sku, name, unit, min_stock, unit_cost);
    audit(req.user.id, 'PRODUCT_CREATE', 'products', info.lastInsertRowid, { sku, name });
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'DUPLICATE_SKU' });
    throw e;
  }
});

app.put('/api/products/:id', requireAuth, requireRole('WAREHOUSE_MANAGER'), (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
  const { name, unit, min_stock, unit_cost, active } = req.body || {};
  db.prepare(
    `UPDATE products SET name=?, unit=?, min_stock=?, unit_cost=?, active=? WHERE id=?`
  ).run(
    name ?? existing.name,
    unit ?? existing.unit,
    min_stock ?? existing.min_stock,
    unit_cost === undefined ? existing.unit_cost : unit_cost,
    active === undefined ? existing.active : active ? 1 : 0,
    id
  );
  audit(req.user.id, 'PRODUCT_UPDATE', 'products', id, req.body);
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
});

function confirmStockVoucher(type, userId, lines, note) {
  if (!Array.isArray(lines) || lines.length === 0) {
    const err = new Error('VALIDATION');
    err.status = 400;
    throw err;
  }
  for (const line of lines) {
    if (!line.product_id || !(Number(line.qty) > 0)) {
      const err = new Error('VALIDATION');
      err.status = 400;
      throw err;
    }
  }

  const tx = db.transaction(() => {
    const voucher = db.prepare(
      `INSERT INTO vouchers (type, status, note, created_by) VALUES (?, 'CONFIRMED', ?, ?)`
    ).run(type, note || null, userId);
    const voucherId = voucher.lastInsertRowid;
    const getProduct = db.prepare('SELECT * FROM products WHERE id = ?');
    const updateQty = db.prepare('UPDATE products SET quantity_on_hand = quantity_on_hand + ? WHERE id = ?');
    const insertLine = db.prepare(
      `INSERT INTO voucher_lines (voucher_id, product_id, qty, unit_cost) VALUES (?, ?, ?, ?)`
    );
    const insertMove = db.prepare(
      `INSERT INTO stock_movements (product_id, delta, voucher_id) VALUES (?, ?, ?)`
    );

    for (const line of lines) {
      const product = getProduct.get(line.product_id);
      if (!product || !product.active) {
        const err = new Error('INACTIVE_OR_MISSING_PRODUCT');
        err.status = 400;
        throw err;
      }
      const qty = Number(line.qty);
      const delta = type === 'IN' ? qty : type === 'OUT' ? -qty : Number(line.delta);
      if (type === 'OUT' && product.quantity_on_hand < qty) {
        const err = new Error('INSUFFICIENT_STOCK');
        err.status = 409;
        err.detail = { product_id: product.id, on_hand: product.quantity_on_hand, requested: qty };
        throw err;
      }
      insertLine.run(voucherId, product.id, type === 'ADJUST' ? Math.abs(delta) : qty, line.unit_cost ?? product.unit_cost);
      updateQty.run(delta, product.id);
      insertMove.run(product.id, delta, voucherId);
    }
    audit(userId, `VOUCHER_${type}`, 'vouchers', voucherId, { lines });
    return voucherId;
  });

  return tx();
}

app.post('/api/vouchers/in', requireAuth, (req, res) => {
  try {
    const id = confirmStockVoucher('IN', req.user.id, req.body?.lines, req.body?.note);
    res.status(201).json({ id, status: 'CONFIRMED' });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message, detail: e.detail });
  }
});

app.post('/api/vouchers/out', requireAuth, (req, res) => {
  try {
    const id = confirmStockVoucher('OUT', req.user.id, req.body?.lines, req.body?.note);
    res.status(201).json({ id, status: 'CONFIRMED' });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message, detail: e.detail });
  }
});

app.post('/api/vouchers/adjust', requireAuth, (req, res) => {
  const { lines, note } = req.body || {};
  if (!Array.isArray(lines) || lines.length === 0) return res.status(400).json({ error: 'VALIDATION' });
  for (const line of lines) {
    if (!line.product_id || line.delta === undefined || Number(line.delta) === 0) {
      return res.status(400).json({ error: 'VALIDATION' });
    }
  }
  const tx = db.transaction(() => {
    const voucher = db.prepare(
      `INSERT INTO vouchers (type, status, note, created_by) VALUES ('ADJUST', 'PENDING', ?, ?)`
    ).run(note || null, req.user.id);
    const voucherId = voucher.lastInsertRowid;
    const insertLine = db.prepare(
      `INSERT INTO voucher_lines (voucher_id, product_id, qty, unit_cost) VALUES (?, ?, ?, ?)`
    );
    for (const line of lines) {
      insertLine.run(voucherId, line.product_id, Number(line.delta), null);
    }
    audit(req.user.id, 'ADJUST_REQUEST', 'vouchers', voucherId, { lines });
    return voucherId;
  });
  const id = tx();
  res.status(201).json({ id, status: 'PENDING' });
});

app.post('/api/vouchers/adjust/:id/approve', requireAuth, requireRole('WAREHOUSE_MANAGER'), (req, res) => {
  const id = Number(req.params.id);
  try {
    const tx = db.transaction(() => {
      const v = db.prepare(`SELECT * FROM vouchers WHERE id = ?`).get(id);
      if (!v || v.type !== 'ADJUST') {
        const err = new Error('NOT_FOUND');
        err.status = 404;
        throw err;
      }
      if (v.status !== 'PENDING') {
        const err = new Error('INVALID_STATUS');
        err.status = 409;
        throw err;
      }
      const lines = db.prepare('SELECT * FROM voucher_lines WHERE voucher_id = ?').all(id);
      const getProduct = db.prepare('SELECT * FROM products WHERE id = ?');
      const updateQty = db.prepare('UPDATE products SET quantity_on_hand = quantity_on_hand + ? WHERE id = ?');
      const insertMove = db.prepare(
        `INSERT INTO stock_movements (product_id, delta, voucher_id) VALUES (?, ?, ?)`
      );
      for (const line of lines) {
        const product = getProduct.get(line.product_id);
        const delta = Number(line.qty); // stored signed delta at create time
        if (product.quantity_on_hand + delta < 0) {
          const err = new Error('INSUFFICIENT_STOCK');
          err.status = 409;
          throw err;
        }
        updateQty.run(delta, product.id);
        insertMove.run(product.id, delta, id);
      }
      db.prepare(
        `UPDATE vouchers SET status='APPROVED', approved_by=?, decided_at=datetime('now') WHERE id=?`
      ).run(req.user.id, id);
      audit(req.user.id, 'ADJUST_APPROVE', 'vouchers', id, null);
    });
    tx();
    res.json({ id, status: 'APPROVED' });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post('/api/vouchers/adjust/:id/reject', requireAuth, requireRole('WAREHOUSE_MANAGER'), (req, res) => {
  const id = Number(req.params.id);
  const v = db.prepare(`SELECT * FROM vouchers WHERE id = ?`).get(id);
  if (!v || v.type !== 'ADJUST') return res.status(404).json({ error: 'NOT_FOUND' });
  if (v.status !== 'PENDING') return res.status(409).json({ error: 'INVALID_STATUS' });
  db.prepare(
    `UPDATE vouchers SET status='REJECTED', approved_by=?, decided_at=datetime('now') WHERE id=?`
  ).run(req.user.id, id);
  audit(req.user.id, 'ADJUST_REJECT', 'vouchers', id, null);
  res.json({ id, status: 'REJECTED' });
});

app.get('/api/vouchers/pending-adjust', requireAuth, requireRole('WAREHOUSE_MANAGER'), (_req, res) => {
  const rows = db.prepare(
    `SELECT v.*, u.display_name AS created_by_name
     FROM vouchers v JOIN users u ON u.id = v.created_by
     WHERE v.type='ADJUST' AND v.status='PENDING' ORDER BY v.id DESC`
  ).all();
  const withLines = rows.map((v) => ({
    ...v,
    lines: db.prepare(
      `SELECT vl.*, p.sku, p.name FROM voucher_lines vl JOIN products p ON p.id = vl.product_id WHERE voucher_id=?`
    ).all(v.id),
  }));
  res.json(withLines);
});

app.get('/api/stock', requireAuth, (_req, res) => {
  const rows = db.prepare(
    `SELECT id, sku, name, unit, min_stock, quantity_on_hand, unit_cost,
            CASE WHEN quantity_on_hand < min_stock THEN 1 ELSE 0 END AS low_stock
     FROM products WHERE active=1 ORDER BY sku`
  ).all();
  res.json(rows);
});

app.get('/api/reports/nxt', requireAuth, (req, res) => {
  const from = req.query.from || '1970-01-01';
  const to = req.query.to || '2999-12-31';
  const includeValue = req.user.role === 'WAREHOUSE_MANAGER';
  const products = db.prepare('SELECT * FROM products WHERE active=1 ORDER BY sku').all();
  const moves = db.prepare(
    `SELECT product_id, delta, created_at FROM stock_movements
     WHERE date(created_at) >= date(?) AND date(created_at) <= date(?)`
  ).all(from, to);
  const result = products.map((p) => {
    const pMoves = moves.filter((m) => m.product_id === p.id);
    const inbound = pMoves.filter((m) => m.delta > 0).reduce((s, m) => s + m.delta, 0);
    const outbound = pMoves.filter((m) => m.delta < 0).reduce((s, m) => s + Math.abs(m.delta), 0);
    // MVP simplified: opening ≈ current - net in period
    const net = inbound - outbound;
    const opening = p.quantity_on_hand - net;
    const closing = p.quantity_on_hand;
    const row = {
      sku: p.sku,
      name: p.name,
      unit: p.unit,
      opening_qty: opening,
      in_qty: inbound,
      out_qty: outbound,
      closing_qty: closing,
    };
    if (includeValue) {
      const cost = p.unit_cost || 0;
      row.closing_value = closing * cost;
    }
    return row;
  });
  res.json({ from, to, rows: result });
});

app.get('/api/reports/nxt.csv', requireAuth, requireRole('WAREHOUSE_MANAGER'), (req, res) => {
  req.query = req.query || {};
  const from = req.query.from || '1970-01-01';
  const to = req.query.to || '2999-12-31';
  // reuse logic via internal call pattern
  const products = db.prepare('SELECT * FROM products WHERE active=1 ORDER BY sku').all();
  const moves = db.prepare(
    `SELECT product_id, delta FROM stock_movements
     WHERE date(created_at) >= date(?) AND date(created_at) <= date(?)`
  ).all(from, to);
  const header = 'sku,name,opening_qty,in_qty,out_qty,closing_qty,closing_value\n';
  const lines = products.map((p) => {
    const pMoves = moves.filter((m) => m.product_id === p.id);
    const inbound = pMoves.filter((m) => m.delta > 0).reduce((s, m) => s + m.delta, 0);
    const outbound = pMoves.filter((m) => m.delta < 0).reduce((s, m) => s + Math.abs(m.delta), 0);
    const net = inbound - outbound;
    const opening = p.quantity_on_hand - net;
    const closing = p.quantity_on_hand;
    const value = closing * (p.unit_cost || 0);
    return `${p.sku},"${p.name}",${opening},${inbound},${outbound},${closing},${value}`;
  });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="nxt-report.csv"');
  res.send(header + lines.join('\n'));
});

app.get('/api/audit', requireAuth, requireRole('WAREHOUSE_MANAGER'), (_req, res) => {
  const rows = db.prepare(
    `SELECT a.*, u.username AS actor
     FROM audit_logs a JOIN users u ON u.id = a.actor_id
     ORDER BY a.id DESC LIMIT 200`
  ).all();
  res.json(rows);
});

// Production: serve Vite build from same origin (Render / single host)
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`PB-03 API listening on http://localhost:${PORT}`);
    if (fs.existsSync(webDist)) console.log(`Serving SPA from ${webDist}`);
  });
}

export { app, JWT_SECRET };
