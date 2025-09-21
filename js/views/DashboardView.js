// js/views/DashboardView.js
const TYPE_ORDER = ['lighting', 'heating', 'cooling', 'appliances', 'electronics'];

 
function updateDeviceTypeTiles(byType = {}) {
  // a) by fixed IDs
  const idMap = {
    lighting:    '#lighting-value',
    heating:     '#heating-value',
    cooling:     '#cooling-value',
    appliances:  '#appliances-value',
    electronics: '#electronics-value',
  };

  Object.entries(idMap).forEach(([type, selector]) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = `${Number(byType[type] || 0).toFixed(1)} kWh`;
  });

 
  TYPE_ORDER.forEach((type) => {
    const node = document.querySelector(`.device-type-item[data-type="${type}"] .device-type-value`);
    if (node) node.textContent = `${Number(byType[type] || 0).toFixed(1)} kWh`;
  });
}


function updateDonutChart(byType = {}) {
  if (!window.deviceChart) return;
  window.deviceChart.data.datasets[0].data = [
    Number(byType.lighting)    || 0,
    Number(byType.heating)     || 0,
    Number(byType.cooling)     || 0,
    Number(byType.appliances)  || 0,
    Number(byType.electronics) || 0,
  ];
  window.deviceChart.update();
}


function renderByType(byType = {}) {
  updateDeviceTypeTiles(byType);
  updateDonutChart(byType);
}


function renderSeries(series = []) {
  if (typeof window.renderEnergySeries === 'function') {
    window.renderEnergySeries(series);
  } else if (window.energyLineChart?.data?.datasets?.[0]) {
    // Minimal, safe update if exposed the chart instance
    window.energyLineChart.data.datasets[0].data = series;
    window.energyLineChart.update();
  }
}


async function loadDashboardEnergy() {
  try {
    const energyData = await ApiService.energy(); // => { series, byType }
    renderSeries(energyData.series || []);
    renderByType(energyData.byType || {});
  } catch (err) {
    console.warn('[Dashboard] ApiService.energy() failed:', err);
    // minimal fallback to keep UI stable
    renderSeries([]);
    renderByType({});
  }
}


async function refreshDeviceTypeSummary() {
  try {
    const res = await fetch('/api/energy/by-type', { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const byType = await res.json();
      updateDeviceTypeTiles(byType);
      return;
    }
    throw new Error(`HTTP ${res.status}`);
  } catch {
    // Fallback: use donut dataset so tiles always match the chart
    const ds = window.deviceChart?.data?.datasets?.[0]?.data || [];
    const byType = {};
    TYPE_ORDER.forEach((k, i) => { byType[k] = Number(ds[i] || 0); });
    updateDeviceTypeTiles(byType);
  }
}


(async function initDashboardView() {
  // Kick off primary load (series + donut + tiles)
  await loadDashboardEnergy();

 
  setTimeout(refreshDeviceTypeSummary, 100);

  // Expose a manual refresher if you change data elsewhere
  window.refreshDeviceTypeSummary = refreshDeviceTypeSummary;
})();
