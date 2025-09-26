// js/app.js

(function () {
  // ------- helpers -------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const fmt = (n, d = 2) => Number(n || 0).toFixed(d);

  function showSection(name) {
    $$('.content-section').forEach(s => s.classList.remove('active'));
    $(`#${name}-content`)?.classList.add('active');
    $$('.nav-item').forEach(li => li.classList.toggle('active', li.dataset.view === name));
  }

  function toast(msg) {
    try { alert(msg); } catch {}
  }

  // ------- dashboard -------
  let energyLine = null;
  let deviceDonut = null;

  async function loadDashboard() {
    try {
      const stats = await ApiService.stats();
      $('#energy-value').textContent = `${fmt(stats.energy, 2)} kWh`;
      $('#cost-value').textContent   = `$${fmt(stats.cost, 2)}`;
      $('#devices-value').textContent = `${fmt(stats.devices, 0)}`;
      $('#savings-value').textContent = `$${fmt(stats.savings, 2)}`;

      const e = await ApiService.energy();

      // line
      const ctxLine = $('#energy-chart').getContext('2d');
      if (energyLine) energyLine.destroy();
      energyLine = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: e.series.map((_, i) => `${i}:00`),
          datasets: [{
            label: 'Energy Consumption (kWh)',
            data: e.series.map(v => Number(v) || 0),
            fill: true,
            tension: 0.3,
          }]
        },
        options: { responsive: true, plugins: { legend: { display: true } } }
      });

      // donut
      const byType = e.byType || { lighting: 12, heating: 28, cooling: 35, appliances: 15, electronics: 10 };
      const donutCtx = $('#device-chart').getContext('2d');
      if (deviceDonut) deviceDonut.destroy();
      deviceDonut = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(byType).map(k => k[0].toUpperCase() + k.slice(1)),
          datasets: [{ data: Object.values(byType).map(v => Number(v) || 0) }]
        },
        options: { responsive: true, cutout: '60%' }
      });
    } catch (err) {
      console.error('loadDashboard error:', err);
      toast('Failed to load dashboard');
    }
  }

  // ------- devices -------
  async function renderDevices() {
    const grid = $('#devices-grid');
    grid.innerHTML = '';
    const list = await ApiService.devices();
    if (!list.length) {
      grid.innerHTML = `<div style="padding:12px;color:#777">No devices yet. Use “Add Device”.</div>`;
      return;
    }
    list.forEach(d => {
      const card = document.createElement('div');
      card.className = 'device-card';
      card.innerHTML = `
        <div class="device-card__header">
          <div class="device-card__title">${d.name || 'Unnamed'}</div>
          <span class="badge ${d.active ? 'active' : 'inactive'}">${d.active ? 'active' : 'inactive'}</span>
        </div>
        <div class="device-card__body">
          <div>Type: <b>${d.type || '-'}</b></div>
          <div>Power Rating: <b>${d.power || 0} W</b></div>
          <div>Location: <b>${d.location || '-'}</b></div>
        </div>
        <div class="device-card__actions">
          <button class="btn btn-primary btn-sm js-edit">Edit</button>
          <button class="btn btn-danger btn-sm js-del">Delete</button>
        </div>
      `;
      card.querySelector('.js-edit').addEventListener('click', async () => {
        const name = prompt('Device name:', d.name || '');
        if (name == null) return;
        const type = prompt('Type (lighting/heating/cooling/appliances/electronics):', d.type || '');
        if (type == null) return;
        const power = Number(prompt('Power (W):', d.power ?? 0));
        const location = prompt('Location:', d.location || '');
        const active = confirm('Active? OK = active, Cancel = inactive');
        await ApiService.updateDevice(d._id, { name, type, power, location, active });
        await renderDevices();
        await loadDashboard();
      });
      card.querySelector('.js-del').addEventListener('click', async () => {
        if (!confirm('Delete this device?')) return;
        await ApiService.deleteDevice(d._id);
        await renderDevices();
        await loadDashboard();
      });
      grid.appendChild(card);
    });
  }

  async function addDeviceFlow() {
    const name = prompt('Device name:');
    if (!name) return;
    const type = prompt('Type (lighting/heating/cooling/appliances/electronics):', 'lighting') || 'lighting';
    const power = Number(prompt('Power (W):', '100')) || 0;
    const location = prompt('Location:', 'Living Room') || 'Home';
    await ApiService.createDevice({ name, type, power, location, active: true });
    await renderDevices();
    await loadDashboard();
  }

  // ------- users -------
  async function renderUsers() {
    const grid = $('#users-grid');
    grid.innerHTML = '';
    const list = await ApiService.users();
    if (!list.length) {
      grid.innerHTML = `<div style="padding:12px;color:#777">No users yet. Use “Add User”.</div>`;
      return;
    }
    list.forEach(u => {
      const card = document.createElement('div');
      card.className = 'user-card';
      card.innerHTML = `
        <div class="user-card__header">
          <div class="user-card__title">${u.name || u.username || 'User'}</div>
          <span class="badge">${u.role || 'user'}</span>
        </div>
        <div class="user-card__body">
          <div>Username: <b>${u.username || '-'}</b></div>
          <div>Email: <b>${u.email || '-'}</b></div>
          <div>Joined: <b>${u.joinedAt ? new Date(u.joinedAt).toDateString() : '-'}</b></div>
        </div>
        <div class="user-card__actions">
          <button class="btn btn-primary btn-sm js-edit">Edit</button>
          <button class="btn btn-danger btn-sm js-del">Delete</button>
        </div>
      `;
      card.querySelector('.js-edit').addEventListener('click', async () => {
        const name = prompt('Name:', u.name || '');
        if (name == null) return;
        const email = prompt('Email:', u.email || '');
        const role = prompt('Role (admin/user):', u.role || 'user') || 'user';
        await ApiService.updateUser(u._id, { name, email, role });
        await renderUsers();
      });
      card.querySelector('.js-del').addEventListener('click', async () => {
        if (!confirm('Delete this user?')) return;
        await ApiService.deleteUser(u._id);
        await renderUsers();
      });
      grid.appendChild(card);
    });
  }

  async function addUserFlow() {
    const name = prompt('Name:');
    if (!name) return;
    const username = prompt('Username:', name.toLowerCase().replace(/\s+/g, '')) || 'user';
    const email = prompt('Email:', `${username}@myems.com`) || '';
    const role = prompt('Role (admin/user):', 'user') || 'user';
    await ApiService.createUser({ name, username, email, role });
    await renderUsers();
  }

  // ------- reports -------
  async function renderReports() {
    const wrap = $('#report-container');
    wrap.innerHTML = '';
    const list = await ApiService.reports();
    if (!list.length) {
      wrap.innerHTML = `<div style="padding:12px;color:#777">No reports yet. Click “Generate Report”.</div>`;
      return;
    }
    list.forEach(r => {
      const row = document.createElement('div');
      row.className = 'report-row';
      row.innerHTML = `
        <div class="report-title"><b>${r.title || 'Report'}</b></div>
        <div>Total Consumption: <b>${fmt(r.totalConsumption || 0)} kWh</b></div>
        <div>Total Cost: <b>$${fmt(r.totalCost || 0)}</b></div>
        <div>Data Points: <b>${r.dataPoints || 0}</b></div>
      `;
      wrap.appendChild(row);
    });
  }

  async function generateReportFlow() {
    const typeSelect = $('#report-type');
    const type = typeSelect?.value || 'daily';
    await ApiService.generateReport(type);
    await renderReports();
  }

  // ------- navigation + events -------
  function wireNav() {
    $$('.nav-item').forEach(li => {
      li.addEventListener('click', async () => {
        const view = li.dataset.view;
        showSection(view);
        if (view === 'dashboard') loadDashboard();
        if (view === 'devices') renderDevices();
        if (view === 'users') renderUsers();
        if (view === 'reports') renderReports();
      });
    });
    $('#logout-btn')?.addEventListener('click', () => location.reload());
    $('#add-device-btn')?.addEventListener('click', addDeviceFlow);
    $('#add-user-btn')?.addEventListener('click', addUserFlow);
    $('#generate-report')?.addEventListener('click', generateReportFlow);
  }

  // ------- boot -------
  async function boot() {
    // skip the legacy login view and show dashboard
    $('#login-view')?.classList.remove('active');
    $('#dashboard-view')?.classList.add('active');
    $('.nav-item[data-view="dashboard"]')?.classList.add('active');

    // header date + user
    const dateEl = $('#current-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    wireNav();

    // initial loads
    await loadDashboard();
    await renderDevices();
    await renderReports();
    await renderUsers();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
