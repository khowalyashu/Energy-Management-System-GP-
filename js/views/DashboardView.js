// js/views/DashboardView.js

// ───────────────────────────────────────────────────────────
// 1) Helpers to write numbers into the 5 tiles and donut
// ───────────────────────────────────────────────────────────
const TYPE_ORDER = ['lighting', 'heating', 'cooling', 'appliances', 'electronics'];

/**
 * Update the text values in the small tiles at the bottom.
 * This supports either:
 *   a) your original IDs:   #lighting-value, #heating-value, ...
 *   b) the class+data hook: .device-type-item[data-type="lighting"] .device-type-value
 */
function updateDeviceTypeTiles(byType = {}) {
  // a) by fixed IDs (your current markup)
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

  // b) optional: by data-type hooks (safe no-op if not present)
  TYPE_ORDER.forEach((type) => {
    const node = document.querySelector(`.device-type-item[data-type="${type}"] .device-type-value`);
    if (node) node.textContent = `${Number(byType[type] || 0).toFixed(1)} kWh`;
  });
}

/**
 * Update the donut chart if it already exists on the page.
 * We DO NOT create or alter the chart config — only its data.
 */
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

/**
 * Render the device-type numbers using the same selectors you already had.
 * (Kept for backwards compatibility; calls both chart + tiles.)
 */
function renderByType(byType = {}) {
  updateDeviceTypeTiles(byType);
  updateDonutChart(byType);
}

// If you already have a line-chart rendering function, we’ll use it.
// Otherwise, this is a harmless no-op.
function renderSeries(series = []) {
  if (typeof window.renderEnergySeries === 'function') {
    window.renderEnergySeries(series);
  } else if (window.energyLineChart?.data?.datasets?.[0]) {
    // Minimal, safe update if you exposed the chart instance
    window.energyLineChart.data.datasets[0].data = series;
    window.energyLineChart.update();
  }
}

// ───────────────────────────────────────────────────────────
// 2) Data loading
// ───────────────────────────────────────────────────────────

/**
 * Primary load: ask ApiService for { series, byType }.
 * Falls back gracefully if anything fails.
 */
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

/**
 * Optional refresher for the bottom tiles:
 *   1) Try `/api/energy/by-type`
 *   2) If not available, read the donut chart dataset
 */
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

// ───────────────────────────────────────────────────────────
// 3) Bootstrap (no top-level await)
// ───────────────────────────────────────────────────────────

(async function initDashboardView() {
  // Kick off primary load (series + donut + tiles)
  await loadDashboardEnergy();

  // If the donut is created slightly later in your flow,
  // this ensures the tiles sync once it’s ready.
  setTimeout(refreshDeviceTypeSummary, 100);

  // Expose a manual refresher if you change data elsewhere
  window.refreshDeviceTypeSummary = refreshDeviceTypeSummary;
})();
