// js/views/ReportsView.js
class ReportsView {
  constructor() {
    this.reportContainer = document.getElementById('report-container');

    // Delegate clicks for View/Delete buttons inside the container
    this.reportContainer?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-action');
      const idx = Number(btn.getAttribute('data-idx'));
      const id = btn.getAttribute('data-id');

      if (action === 'view') {
        const report = this._lastReports?.[idx];
        if (report) this.showReportDetail(report);
      } else if (action === 'delete') {
        // Bubble to whoever manages deletes
        window.dispatchEvent(new CustomEvent('reports:delete', { detail: { id, index: idx } }));
      }
    });
  }

  /**
   * Render the reports as cards in a grid.
   * Accepts slightly different shapes (totalKWh vs totalConsumption, points vs data.length, etc.)
   */
  displayReports(reports) {
    this._lastReports = Array.isArray(reports) ? reports : [];
    this.reportContainer.innerHTML = '';

    if (!this._lastReports.length) {
      this.reportContainer.innerHTML = `
        <div class="report-card">
          <em>No reports found. Generate your first report to view analytics.</em>
        </div>
      `;
      return;
    }

    const frag = document.createDocumentFragment();
    this._lastReports.forEach((r, idx) => frag.appendChild(this.createReportCard(r, idx)));
    this.reportContainer.appendChild(frag);
  }

  /**
   * Build a single card.
   */
  createReportCard(report, idx) {
    // Title
    const type = (report.type ? String(report.type) : 'Report').replace(/^\w/, c => c.toUpperCase());
    const period = report.period || report.range || report.title || '';
    const generatedAt = report.generatedAt || report.createdAt || Date.now();

    // Metrics with fallbacks
    const totalKWh = this._num(report.totalConsumption ?? report.totalKWh ?? report.kwh, 2);
    const totalCost = this._num(report.totalCost ?? report.cost, 2);
    const points = this._int(
      report.points ?? report.count ?? (Array.isArray(report.data) ? report.data.length : 0)
    );

    const card = document.createElement('div');
    card.className = 'report-card';
    card.innerHTML = `
      <h4>${type}${period ? ` — ${this._escape(period)}` : ''}</h4>
      <div class="report-metric">
        <span class="label">Total Consumption:</span>
        <span class="value">${totalKWh.toFixed(2)} kWh</span>
      </div>
      <div class="report-metric">
        <span class="label">Total Cost:</span>
        <span class="value">$${totalCost.toFixed(2)}</span>
      </div>
      <div class="report-metric">
        <span class="label">Data Points:</span>
        <span class="value">${points}</span>
      </div>
      <div class="report-metric" style="margin-top:.25rem; color:#6b7280;">
        <span class="label">Generated:</span>
        <span class="value">${new Date(generatedAt).toLocaleString()}</span>
      </div>
      <div style="margin-top:.75rem; display:flex; gap:.5rem;">
        <button class="btn btn-primary" data-action="view" data-id="${this._escape(report.id ?? report._id ?? idx)}" data-idx="${idx}">View Details</button>
        <button class="btn btn-secondary" data-action="delete" data-id="${this._escape(report.id ?? report._id ?? idx)}" data-idx="${idx}">Delete</button>
      </div>
    `;
    return card;
  }

  /**
   * Detail modal with pie chart by device type.
   */
  showReportDetail(report) {
    const modalHtml = `
      <div class="modal" id="report-detail-modal">
        <div class="modal-content">
          <h2>${this._title(report)}</h2>
          <div class="report-summary">
            <div class="summary-item">
              <h3>Total Consumption</h3>
              <p>${(report.totalConsumption ?? report.totalKWh ?? report.kwh ?? 0).toFixed(2)} kWh</p>
            </div>
            <div class="summary-item">
              <h3>Total Cost</h3>
              <p>$${(report.totalCost ?? report.cost ?? 0).toFixed(2)}</p>
            </div>
            <div class="summary-item">
              <h3>Generated On</h3>
              <p>${new Date(report.generatedAt || report.createdAt || Date.now()).toLocaleString()}</p>
            </div>
          </div>
          <div class="report-chart-container">
            <canvas id="report-detail-chart" height="300"></canvas>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="close-report-detail">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    try { this.renderReportChart(report); } catch (e) { console.error(e); }

    document.getElementById('close-report-detail')?.addEventListener('click', () => {
      document.getElementById('report-detail-modal')?.remove();
    });
  }

  /**
   * Build a pie chart of consumption by deviceType.
   */
  renderReportChart(report) {
    const canvas = document.getElementById('report-detail-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const byType = {};
    (report.data || []).forEach((row) => {
      const key = String(row.deviceType || row.type || 'unknown');
      const val = Number(row.consumption ?? row.kwh ?? row.value ?? 0) || 0;
      byType[key] = (byType[key] || 0) + val;
    });

    const labels = Object.keys(byType);
    const data = Object.values(byType);

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
            '#1abc9c', '#d35400', '#7f8c8d', '#16a085', '#e67e22'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Energy Consumption by Device Type' }
        }
      }
    });
  }

  // ---------- helpers ----------
  _escape(v) {
    return String(v ?? '').replace(/[&<>"'`=\/]/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
    }[s]));
  }
  _num(v, fixed = 2) {
    const n = Number(v);
    return Number.isFinite(n) ? Number(n.toFixed(fixed)) : 0;
  }
  _int(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  _title(report) {
    const type = (report.type ? String(report.type) : 'Report').replace(/^\w/, c => c.toUpperCase());
    const period = report.period || report.range || report.title || '';
    return `${type}${period ? ` — ${this._escape(period)}` : ''}`;
  }
}

// Expose ReportsView on window
window.ReportsView = ReportsView;
