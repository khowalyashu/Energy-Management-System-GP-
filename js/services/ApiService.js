// js/services/ApiService.js
// Universal API client with Mongo-first CRUD and localStorage fallback.

(function () {
  const BASE = '/api';

  // ---------------- token handling ----------------
  const LS_TOKEN = 'myems.jwt';
  const LS_KEYS = {
    devices: 'myems.devices',
    users: 'myems.users',
    reports: 'myems.reports',
  };

  let token = null;
  try {
    token = localStorage.getItem(LS_TOKEN) || null;
  } catch { }

  function setToken(t) {
    token = t || null;
    try {
      if (token) localStorage.setItem(LS_TOKEN, token);
      else localStorage.removeItem(LS_TOKEN);
    } catch { }
  }

  // --------------- localStorage helpers ---------------
  function readLS(key, def = []) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : def;
    } catch {
      return def;
    }
  }
  function writeLS(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { }
  }
  function uid(prefix = '') {
    return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Seed some demo content (only the first time)
  (function seed() {
    if (!readLS(LS_KEYS.devices).length) {
      writeLS(LS_KEYS.devices, [
        { _id: uid('dev_'), name: 'Living Room Lights', type: 'lighting', power: 100, location: 'Living Room', active: true },
        { _id: uid('dev_'), name: 'Kitchen HVAC', type: 'heating', power: 1500, location: 'Kitchen', active: true },
        { _id: uid('dev_'), name: 'Office Computer', type: 'electronics', power: 300, location: 'Office', active: false },
      ]);
    }
    if (!readLS(LS_KEYS.users).length) {
      writeLS(LS_KEYS.users, [
        { _id: uid('usr_'), name: 'Administrator', role: 'admin', username: 'admin', email: 'admin@myems.com', joinedAt: new Date().toISOString() },
      ]);
    }
    if (!readLS(LS_KEYS.reports).length) {
      writeLS(LS_KEYS.reports, []);
    }
  })();

  // --------------- request helper (Mongo-first) ---------------
  async function request(path, { method = 'GET', body } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Helpful for dev while auth is not wired everywhere.
      headers['x-dev-bypass'] = 'true';
    }

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return null;

    let data = null;
    try { data = await res.json(); } catch { }

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || res.statusText || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // --------------- payload normalizers (match Mongoose) ---------------
  function normalizeDevicePayload(p) {
    if (!p || typeof p !== 'object') return {};
    const out = { ...p };

    // Map UI/local fields to schema names
    if (out.power !== undefined && out.powerRating === undefined) {
      out.powerRating = Number(out.power) || 0;
    }
    if (out.active !== undefined && out.status === undefined) {
      out.status = out.active ? 'active' : 'inactive';
    }
    if (out.energyConsumption === undefined) {
      out.energyConsumption = Number(out.energyConsumption || 0);
    }
    if (out.type === undefined && out.deviceType !== undefined) {
      out.type = out.deviceType;
    }
    if (out.location === undefined) out.location = '';
    if (out.userId === undefined) out.userId = '1';

    // Remove UI-only keys so strict schemas don't choke
    delete out.power;       // we now send powerRating
    delete out.deviceType;  // we now send type
    delete out.active;      // we now send status

    return out;
  }

  function normalizeUserPayload(p) {
    if (!p || typeof p !== 'object') return {};
    const out = { ...p };

    if (!out.username && out.email) {
      out.username = String(out.email).split('@')[0];
    }
    if (!out.name && out.username) {
      out.name = out.username;
    }
    if (!out.role) out.role = 'user';

    return out;
  }

  // --------------- Auth ---------------
  async function login(username, password) {
    try {
      const data = await request('/auth/login', { method: 'POST', body: { username, password } });
      if (data?.token) setToken(data.token);
      return data || { ok: true };
    } catch {
      // mock success to keep the UI usable
      setToken(null);
      return { ok: true, token: null, user: { username: username || 'admin' } };
    }
  }

  async function updateProfile(payload) {
    try { return await request('/auth/profile', { method: 'PUT', body: payload }); }
    catch { return { ok: true }; }
  }

  // --------------- Dashboard / Energy ---------------
  async function stats() {
    try {
      const s = await request('/energy/stats');
      const devicesList = await devices();
      const energy = Number(s.totalConsumption ?? s.energy ?? 0);
      const cost = Number(s.totalCost ?? s.cost ?? 0);
      const devs = Number(s.devices ?? devicesList.length ?? 0);
      const savings = Number(s.potentialSavings ?? s.savings ?? Math.max(0, (energy * 0.6 - cost) * 0.2));
      return { energy, cost, devices: devs, savings };
    } catch {
      const devs = readLS(LS_KEYS.devices);
      const active = devs.filter(d => d.active).length;
      const energy = Math.round((devs.reduce((a, d) => a + (d.power || d.powerRating || 0), 0) / 1000) * 7.472) || 0;
      const cost = Number((energy * 0.118).toFixed(2));
      const savings = Number((energy * 0.08).toFixed(2));
      return { energy, cost, devices: active, savings };
    }
  }

  async function energy() {
    try {
      const data = await request('/energy');
      let series = [];
      if (Array.isArray(data)) {
        series = typeof data[0] === 'number' ? data : data.map(d => Number(d.value ?? d.v ?? d.y ?? d.consumption ?? 0));
      } else if (data?.series) {
        series = data.series.map(n => Number(n) || 0);
      }
      if (!series.length) throw new Error('no series');
      return {
        series,
        byType: data.byType ?? { lighting: 12, heating: 28, cooling: 35, appliances: 15, electronics: 10 },
      };
    } catch {
      const series = Array.from({ length: 24 }, (_, i) =>
        Math.max(0, 9 + 3 * Math.sin((i / 24) * Math.PI * 2) + (Math.random() - 0.5))
      );
      return {
        series,
        byType: { lighting: 12, heating: 28, cooling: 35, appliances: 15, electronics: 10 },
      };
    }
  }

  // --------------- Reports ---------------
  async function reports(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.deviceType) params.append('deviceType', filters.deviceType);
      if (filters.search) params.append('search', filters.search);

      const url = `/reports${params.toString() ? '?' + params.toString() : ''}`;
      return await request(url);
    }
    catch { return readLS(LS_KEYS.reports, []); }
  }

  async function getReport(id) {
    try { return await request(`/reports/${encodeURIComponent(id)}`); }
    catch { return readLS(LS_KEYS.reports, []).find(r => r._id === id) || null; }
  }

  async function generateReport(options = {}) {
    const { type = 'daily', deviceType = null, costPerKwh = 0.12 } = options;
    try {
      return await request('/reports/generate', {
        method: 'POST',
        body: { type, deviceType, costPerKwh }
      });
    } catch {
      const list = readLS(LS_KEYS.reports, []);
      const now = new Date();
      const r = {
        _id: uid('rpt_'),
        title: `${type[0].toUpperCase() + type.slice(1)} Report - ${now.toDateString()}`,
        type,
        period: now.toDateString(),
        generatedAt: now.toISOString(),
        lastUpdated: now.toISOString(),
        totalConsumption: Number((Math.random() * 120 + 20).toFixed(2)),
        totalCost: Number((Math.random() * 40 + 5).toFixed(2)),
        dataPoints: Math.floor(Math.random() * 200 + 80),
        deviceTypeFilter: deviceType,
        costPerKwh,
        weeklyStats: {
          total: Number((Math.random() * 120 + 20).toFixed(2)),
          min: Number((Math.random() * 5 + 1).toFixed(2)),
          max: Number((Math.random() * 20 + 10).toFixed(2)),
          avg: Number((Math.random() * 15 + 5).toFixed(2))
        },
        peakHours: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          consumption: Number((Math.random() * 10 + 2).toFixed(2)),
          isPeak: [9, 14, 19].includes(i)
        })),
        filename: `${type}_report_${Date.now()}.pdf`
      };
      list.unshift(r);
      writeLS(LS_KEYS.reports, list);
      return r;
    }
  }

  async function deleteReport(id) {
    try {
      return await request(`/reports/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {
      const list = readLS(LS_KEYS.reports, []);
      writeLS(LS_KEYS.reports, list.filter(r => r._id !== id));
      return { ok: true };
    }
  }

  function exportReportCSV(id) {
    const token = localStorage.getItem('token');
    const url = `${window.location.origin}${BASE}/reports/${encodeURIComponent(id)}/export/csv`;

    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    link.style.display = 'none';

    // Add authorization header by using fetch instead
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(err => console.error('Export CSV failed:', err));
  }

  function exportReportExcel(id) {
    const token = localStorage.getItem('token');
    const url = `${window.location.origin}${BASE}/reports/${encodeURIComponent(id)}/export/excel`;

    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    link.style.display = 'none';

    // Add authorization header by using fetch instead
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(err => console.error('Export Excel failed:', err));
  }

  // --------------- Devices (CRUD with normalization) ---------------
  async function devices() {
    try { return await request('/devices'); }
    catch { return readLS(LS_KEYS.devices, []); }
  }

  async function device(id) {
    try { return await request(`/devices/${encodeURIComponent(id)}`); }
    catch { return readLS(LS_KEYS.devices, []).find(d => d._id === id) || null; }
  }

  async function createDevice(payload) {
    const body = normalizeDevicePayload(payload);
    try {
      return await request('/devices', { method: 'POST', body });
    } catch {
      const list = readLS(LS_KEYS.devices, []);
      const doc = { _id: uid('dev_'), active: true, ...payload };
      list.unshift(doc);
      writeLS(LS_KEYS.devices, list);
      return doc;
    }
  }

  async function updateDevice(id, payload) {
    const body = normalizeDevicePayload(payload);
    try {
      return await request(`/devices/${encodeURIComponent(id)}`, { method: 'PUT', body });
    } catch {
      const list = readLS(LS_KEYS.devices, []);
      const idx = list.findIndex(d => d._id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload };
        writeLS(LS_KEYS.devices, list);
        return list[idx];
      }
      throw new Error('Device not found');
    }
  }

  async function deleteDevice(id) {
    try {
      return await request(`/devices/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {
      const list = readLS(LS_KEYS.devices, []);
      writeLS(LS_KEYS.devices, list.filter(d => d._id !== id));
      return { ok: true };
    }
  }

  // --------------- Users (CRUD with normalization) ---------------
  async function users() {
    try { return await request('/users'); }
    catch { return readLS(LS_KEYS.users, []); }
  }

  async function user(id) {
    try { return await request(`/users/${encodeURIComponent(id)}`); }
    catch { return readLS(LS_KEYS.users, []).find(u => u._id === id) || null; }
  }

  async function createUser(payload) {
    const body = normalizeUserPayload(payload);
    try {
      return await request('/users', { method: 'POST', body });
    } catch {
      const list = readLS(LS_KEYS.users, []);
      const doc = { _id: uid('usr_'), joinedAt: new Date().toISOString(), ...payload };
      list.unshift(doc);
      writeLS(LS_KEYS.users, list);
      return doc;
    }
  }

  async function updateUser(id, payload) {
    const body = normalizeUserPayload(payload);
    try {
      return await request(`/users/${encodeURIComponent(id)}`, { method: 'PUT', body });
    } catch {
      const list = readLS(LS_KEYS.users, []);
      const idx = list.findIndex(u => u._id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload };
        writeLS(LS_KEYS.users, list);
        return list[idx];
      }
      throw new Error('User not found');
    }
  }

  async function deleteUser(id) {
    try {
      return await request(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {
      const list = readLS(LS_KEYS.users, []);
      writeLS(LS_KEYS.users, list.filter(u => u._id !== id));
      return { ok: true };
    }
  }

  // --------------- export to window ---------------
  window.ApiService = {
    // auth
    login, updateProfile,
    // dashboard
    stats, energy,
    // reports
    reports, getReport, generateReport, deleteReport, exportReportCSV, exportReportExcel,
    // devices
    devices, device, createDevice, updateDevice, deleteDevice,
    // users
    users, user, createUser, updateUser, deleteUser,
    // token util (optional use)
    _setToken: setToken,
  };
})();
