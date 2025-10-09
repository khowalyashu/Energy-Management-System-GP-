(function () {
  let energyChartInstance = null;
  let deviceChartInstance = null;

  async function refreshCards() {
    try {
      const s = await ApiService.stats();
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('energy-value', `${s.energy} kWh`);
      set('cost-value', `$${s.cost}`);
      set('devices-value', `${s.devices}`);
      set('savings-value', `$${s.savings}`);
    } catch (e) {
      console.error('refreshCards failed', e);
    }
  }

  function ensureCharts() {
    if (window.DashboardView?.getEnergyChart) {
      energyChartInstance = DashboardView.getEnergyChart();
    }
    if (window.DashboardView?.getDeviceTypeChart) {
      deviceChartInstance = DashboardView.getDeviceTypeChart();
    }
    const energyCtx = document.getElementById('energy-chart')?.getContext('2d');
    const deviceCtx = document.getElementById('device-chart')?.getContext('2d');
    if (energyCtx && !energyChartInstance && window.Chart) {
      energyChartInstance = new Chart(energyCtx, {
        type: 'line', data: { labels: [], datasets: [{ label: 'kWh', data: [] }] },
        options: { responsive: true, animation: false }
      });
    }
    if (deviceCtx && !deviceChartInstance && window.Chart) {
      deviceChartInstance = new Chart(deviceCtx, {
        type: 'doughnut', data: { labels: [], datasets: [{ data: [] }] },
        options: { responsive: true, animation: false }
      });
    }
  }

  async function refreshCharts() {
    try {
      const e = await ApiService.energy();
      ensureCharts();
      if (energyChartInstance) {
        energyChartInstance.data.labels = e.series.map((_, i) => String(i + 1));
        energyChartInstance.data.datasets[0].data = e.series;
        energyChartInstance.update();
      }
      if (deviceChartInstance) {
        const labels = Object.keys(e.byType || {});
        const values = Object.values(e.byType || {});
        deviceChartInstance.data.labels = labels;
        deviceChartInstance.data.datasets[0].data = values;
        deviceChartInstance.update();
      }
    } catch (err) {
      console.error('refreshCharts failed', err);
    }
  }

  async function refreshAll() {
    await refreshCards();
    await refreshCharts();
  }

  window.addEventListener('DOMContentLoaded', () => {
    refreshAll();
  });

  EventBus?.on('devices:changed', refreshAll);
  EventBus?.on('energy:changed',  refreshAll);
  EventBus?.on('reports:generated', refreshAll);

  window.DashboardLiveRefresh = { refreshAll };
})();