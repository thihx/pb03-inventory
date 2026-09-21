import React, { useEffect, useMemo, useState } from 'react';

const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export default function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('pb03_session');
    return raw ? JSON.parse(raw) : null;
  });

  function logout() {
    localStorage.removeItem('pb03_session');
    setSession(null);
  }

  function onLogin(next) {
    localStorage.setItem('pb03_session', JSON.stringify(next));
    setSession(next);
  }

  if (!session) return <Login onLogin={onLogin} />;
  return <Shell session={session} onLogout={logout} />;
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('clerk');
  const [password, setPassword] = useState('Clerk@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api('/auth/login', { method: 'POST', body: { username, password } });
      onLogin(data);
    } catch {
      setError('Đăng nhập thất bại. Kiểm tra tài khoản.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="badge">PB-03</div>
        <h1>Quản lý kho nội bộ</h1>
        <p>Walking Skeleton Capstone — nhập / xuất / tồn có kiểm soát.</p>
        <div className="field">
          <label htmlFor="user">Tài khoản</label>
          <input id="user" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="pass">Mật khẩu</label>
          <input id="pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Đang vào…' : 'Đăng nhập'}</button>
        <p className="hint">Demo: <code>clerk / Clerk@123</code> · <code>manager / Manager@123</code></p>
      </form>
    </div>
  );
}

function Shell({ session, onLogout }) {
  const isManager = session.user.role === 'WAREHOUSE_MANAGER';
  const [tab, setTab] = useState('stock');
  const token = session.token;

  const tabs = useMemo(() => {
    const base = [
      { id: 'stock', label: 'Tồn kho' },
      { id: 'in', label: 'Phiếu nhập' },
      { id: 'out', label: 'Phiếu xuất' },
      { id: 'adjust', label: 'Điều chỉnh' },
      { id: 'report', label: 'Báo cáo NXT' },
    ];
    if (isManager) {
      base.splice(1, 0, { id: 'products', label: 'Danh mục' });
      base.push({ id: 'audit', label: 'Audit' });
    }
    return base;
  }, [isManager]);

  return (
    <div className="shell">
      <div className="topbar">
        <div>
          <div className="brand">PB-03 · Kho nội bộ</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {session.user.display_name} · {session.user.role}
          </div>
        </div>
        <div className="nav">
          {tabs.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} type="button" onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
          <button type="button" className="secondary" onClick={onLogout}>Thoát</button>
        </div>
      </div>

      {tab === 'stock' && <StockView token={token} />}
      {tab === 'products' && isManager && <ProductsView token={token} />}
      {tab === 'in' && <VoucherForm token={token} type="in" title="Phiếu nhập kho" />}
      {tab === 'out' && <VoucherForm token={token} type="out" title="Phiếu xuất kho" />}
      {tab === 'adjust' && <AdjustView token={token} isManager={isManager} />}
      {tab === 'report' && <ReportView token={token} isManager={isManager} />}
      {tab === 'audit' && isManager && <AuditView token={token} />}
    </div>
  );
}

function StockView({ token }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setRows(await api('/stock', { token }));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, [token]);

  return (
    <div className="panel">
      <h2>Tồn hiện tại</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>SKU</th><th>Tên</th><th>ĐVT</th><th>Tồn</th><th>Min</th><th>Cảnh báo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.sku}</td>
              <td>{r.name}</td>
              <td>{r.unit}</td>
              <td>{r.quantity_on_hand}</td>
              <td>{r.min_stock}</td>
              <td className={r.low_stock ? 'low' : ''}>{r.low_stock ? 'Dưới min' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: '0.75rem' }}>
        <button type="button" className="secondary" onClick={load}>Làm mới</button>
      </p>
    </div>
  );
}

function ProductsView({ token }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ sku: '', name: '', unit: 'pcs', min_stock: 0, unit_cost: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setRows(await api('/products', { token }));
  }
  useEffect(() => { load().catch((e) => setError(e.message)); }, [token]);

  async function create(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await api('/products', {
        method: 'POST',
        token,
        body: {
          ...form,
          min_stock: Number(form.min_stock),
          unit_cost: form.unit_cost === '' ? null : Number(form.unit_cost),
        },
      });
      setMsg('Đã tạo sản phẩm.');
      setForm({ sku: '', name: '', unit: 'pcs', min_stock: 0, unit_cost: '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="panel">
      <h2>Danh mục hàng hoá (Manager)</h2>
      <form className="row-form" onSubmit={create}>
        <label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></label>
        <label>Tên<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
        <label>ĐVT<input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
        <label>Min<input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} /></label>
        <label>Giá vốn<input type="number" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} /></label>
        <button type="submit">Thêm</button>
      </form>
      {msg && <p className="ok">{msg}</p>}
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>SKU</th><th>Tên</th><th>Tồn</th><th>Min</th><th>Giá vốn</th><th>Active</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.sku}</td><td>{r.name}</td><td>{r.quantity_on_hand}</td>
              <td>{r.min_stock}</td><td>{r.unit_cost ?? '—'}</td><td>{r.active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VoucherForm({ token, type, title }) {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/products', { token }).then((rows) => {
      const active = rows.filter((p) => p.active);
      setProducts(active);
      if (active[0]) setProductId(String(active[0].id));
    });
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api(`/vouchers/${type}`, {
        method: 'POST',
        token,
        body: { note, lines: [{ product_id: Number(productId), qty: Number(qty) }] },
      });
      setMsg(type === 'in' ? 'Nhập kho thành công — tồn đã tăng.' : 'Xuất kho thành công — tồn đã giảm.');
    } catch (err) {
      if (err.status === 409) setError('Không đủ tồn (409). Tồn không đổi.');
      else setError(err.message);
    }
  }

  return (
    <div className="panel">
      <h2>{title}</h2>
      <form className="row-form" onSubmit={submit}>
        <label>Hàng
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.sku} — {p.name} (tồn {p.quantity_on_hand})</option>
            ))}
          </select>
        </label>
        <label>Số lượng<input type="number" min="0.01" step="any" value={qty} onChange={(e) => setQty(e.target.value)} required /></label>
        <label>Ghi chú<input value={note} onChange={(e) => setNote(e.target.value)} /></label>
        <button type="submit">Xác nhận</button>
      </form>
      {msg && <p className="ok">{msg}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function AdjustView({ token, isManager }) {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [delta, setDelta] = useState(-1);
  const [note, setNote] = useState('');
  const [pending, setPending] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    const rows = await api('/products', { token });
    setProducts(rows.filter((p) => p.active));
    if (rows[0]) setProductId(String(rows[0].id));
    if (isManager) setPending(await api('/vouchers/pending-adjust', { token }));
  }

  useEffect(() => { refresh().catch((e) => setError(e.message)); }, [token, isManager]);

  async function create(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const res = await api('/vouchers/adjust', {
        method: 'POST',
        token,
        body: { note, lines: [{ product_id: Number(productId), delta: Number(delta) }] },
      });
      setMsg(`Đã gửi điều chỉnh #${res.id} — chờ Quản lý duyệt (tồn chưa đổi).`);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function decide(id, action) {
    await api(`/vouchers/adjust/${id}/${action}`, { method: 'POST', token });
    setMsg(`Phiếu #${id} → ${action}`);
    await refresh();
  }

  return (
    <div className="panel">
      <h2>Điều chỉnh tồn (kiểm kê)</h2>
      <form className="row-form" onSubmit={create}>
        <label>Hàng
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.sku} — tồn {p.quantity_on_hand}</option>)}
          </select>
        </label>
        <label>Delta (+/−)<input type="number" step="any" value={delta} onChange={(e) => setDelta(e.target.value)} required /></label>
        <label>Lý do<input value={note} onChange={(e) => setNote(e.target.value)} required /></label>
        <button type="submit">Gửi duyệt</button>
      </form>
      {msg && <p className="ok">{msg}</p>}
      {error && <p className="error">{error}</p>}
      {isManager && (
        <>
          <h2 style={{ marginTop: '1.25rem' }}>Chờ duyệt</h2>
          <table>
            <thead><tr><th>ID</th><th>Người tạo</th><th>Chi tiết</th><th>Thao tác</th></tr></thead>
            <tbody>
              {pending.map((v) => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td>{v.created_by_name}</td>
                  <td>{v.lines.map((l) => `${l.sku}: ${l.qty}`).join(', ')}</td>
                  <td style={{ display: 'flex', gap: '0.35rem' }}>
                    <button type="button" onClick={() => decide(v.id, 'approve')}>Duyệt</button>
                    <button type="button" className="danger" onClick={() => decide(v.id, 'reject')}>Từ chối</button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan={4}>Không có phiếu pending.</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function ReportView({ token, isManager }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await api('/reports/nxt', { token });
      setRows(data.rows);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => { load(); }, [token]);

  return (
    <div className="panel">
      <h2>Báo cáo nhập–xuất–tồn</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>SKU</th><th>Tên</th><th>Tồn đầu*</th><th>Nhập</th><th>Xuất</th><th>Tồn cuối</th>
            {isManager && <th>Giá trị cuối</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sku}>
              <td>{r.sku}</td><td>{r.name}</td><td>{r.opening_qty}</td>
              <td>{r.in_qty}</td><td>{r.out_qty}</td><td>{r.closing_qty}</td>
              {isManager && <td>{r.closing_value ?? '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>*MVP: tồn đầu suy từ tồn hiện tại − biến động trong kỳ.</p>
      {isManager && (
        <p>
          <a href={`${API}/reports/nxt.csv`} onClick={async (e) => {
            e.preventDefault();
            const res = await fetch(`${API}/reports/nxt.csv`, { headers: { Authorization: `Bearer ${token}` } });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nxt-report.csv';
            a.click();
          }}>Tải CSV</a>
        </p>
      )}
    </div>
  );
}

function AuditView({ token }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api('/audit', { token }).then(setRows).catch(() => setRows([]));
  }, [token]);
  return (
    <div className="panel">
      <h2>Audit log (Manager)</h2>
      <table>
        <thead><tr><th>ID</th><th>Actor</th><th>Action</th><th>Entity</th><th>At</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td><td>{r.actor}</td><td>{r.action}</td>
              <td>{r.entity}:{r.entity_id}</td><td>{r.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
