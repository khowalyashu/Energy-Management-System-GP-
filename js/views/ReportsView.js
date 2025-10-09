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

<<<<<<< HEAD
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
=======
    renderFilters() {
        const filtersHtml = `
            <div class="report-filters" style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
                    <div style="flex: 1; min-width: 200px;">
                        <label for="device-type-filter" style="display: block; margin-bottom: 5px; font-weight: 500;">Filter by Device Type:</label>
                        <select id="device-type-filter" class="form-control" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">All Devices</option>
                            <option value="lighting">Lighting</option>
                            <option value="heating">Heating</option>
                            <option value="cooling">Cooling (AC)</option>
                            <option value="appliances">Appliances</option>
                            <option value="electronics">Electronics (EV Charger)</option>
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <label for="report-search" style="display: block; margin-bottom: 5px; font-weight: 500;">Search by Filename:</label>
                        <input type="text" id="report-search" class="form-control" placeholder="Search reports..." 
                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="padding-top: 22px;">
                        <button id="apply-filters-btn" class="btn btn-primary" style="padding: 8px 20px;">
                            <i class="fas fa-filter"></i> Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.reportContainer.insertAdjacentHTML('afterbegin', filtersHtml);
    }

    displayReports(reports) {
        // Clear existing content except filters
        const existingFilters = this.reportContainer.querySelector('.report-filters');
        this.reportContainer.innerHTML = '';

        // Re-add filters
        if (!existingFilters) {
            this.renderFilters();
        } else {
            this.reportContainer.appendChild(existingFilters);
        }

        if (reports.length === 0) {
            this.reportContainer.insertAdjacentHTML('beforeend', `
                <div class="no-reports" style="text-align: center; padding: 60px 20px; color: #999;">
                    <i class="fas fa-chart-bar" style="font-size: 64px; margin-bottom: 20px;"></i>
                    <p style="font-size: 18px; margin: 0;">No reports found. Generate your first report to view analytics.</p>
                    <p style="font-size: 14px; margin-top: 10px; color: #666;">Try adjusting your filters or generate a new report.</p>
                </div>
            `);
            return;
        }

        const reportsList = document.createElement('div');
        reportsList.className = 'reports-list';

        reports.forEach(report => {
            const reportItem = this.createReportItem(report);
            reportsList.appendChild(reportItem);
        });

        this.reportContainer.appendChild(reportsList);
    }

    createReportItem(report) {
        const item = document.createElement('div');
        item.className = 'report-item';

        const lastUpdated = report.lastUpdated
            ? new Date(report.lastUpdated).toLocaleString()
            : new Date(report.generatedAt).toLocaleString();

        const deviceFilter = report.deviceTypeFilter
            ? `<span class="device-filter-badge" style="background: #3498db; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;">
                <i class="fas fa-filter"></i> ${report.deviceTypeFilter}
               </span>`
            : '';

        const comparisonBadge = report.type === 'comparison' && report.comparisonData
            ? `<span class="comparison-badge" style="background: ${report.comparisonData.percentageChange >= 0 ? '#e74c3c' : '#2ecc71'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;">
                ${report.comparisonData.percentageChange >= 0 ? '↑' : '↓'} ${Math.abs(report.comparisonData.percentageChange)}%
               </span>`
            : '';

        item.innerHTML = `
            <div class="report-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <h3 style="margin: 0 0 5px 0;">${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report - ${report.period}${deviceFilter}${comparisonBadge}</h3>
                    <div style="font-size: 12px; color: #666;">
                        <span><i class="fas fa-calendar"></i> Generated: ${new Date(report.generatedAt).toLocaleDateString()}</span>
                        <span style="margin-left: 15px;"><i class="fas fa-clock"></i> Last Updated: ${lastUpdated}</span>
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 3px;">
                        <i class="fas fa-file"></i> ${report.filename || 'N/A'}
                    </div>
                </div>
                <span class="report-date" style="font-size: 14px; color: #999;">${new Date(report.generatedAt).toLocaleDateString()}</span>
            </div>
            <div class="report-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div class="report-stat" style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
                    <span class="stat-label" style="display: block; font-size: 12px; color: #666; margin-bottom: 5px;">Total Consumption:</span>
                    <span class="stat-value" style="display: block; font-size: 18px; font-weight: bold; color: #2c3e50;">${report.totalConsumption.toFixed(2)} kWh</span>
                </div>
                <div class="report-stat" style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
                    <span class="stat-label" style="display: block; font-size: 12px; color: #666; margin-bottom: 5px;">Total Cost:</span>
                    <span class="stat-value" style="display: block; font-size: 18px; font-weight: bold; color: #e74c3c;">$${report.totalCost.toFixed(2)}</span>
                </div>
                <div class="report-stat" style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
                    <span class="stat-label" style="display: block; font-size: 12px; color: #666; margin-bottom: 5px;">Data Points:</span>
                    <span class="stat-value" style="display: block; font-size: 18px; font-weight: bold; color: #3498db;">${report.dataPoints}</span>
                </div>
                <div class="report-stat" style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
                    <span class="stat-label" style="display: block; font-size: 12px; color: #666; margin-bottom: 5px;">Cost Estimate:</span>
                    <span class="stat-value" style="display: block; font-size: 18px; font-weight: bold; color: #f39c12;">$${(report.totalConsumption * (report.costPerKwh || 0.12)).toFixed(2)}</span>
                </div>
            </div>
            ${report.weeklyStats ? `
                <div class="weekly-stats" style="background: #e8f5e9; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #2e7d32;">📊 Weekly Summary Statistics</h4>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 12px;">
                        <div><strong>Total:</strong> ${report.weeklyStats.total} kWh</div>
                        <div><strong>Min:</strong> ${report.weeklyStats.min} kWh</div>
                        <div><strong>Max:</strong> ${report.weeklyStats.max} kWh</div>
                        <div><strong>Avg:</strong> ${report.weeklyStats.avg} kWh</div>
                    </div>
                </div>
            ` : ''}
            ${report.type === 'comparison' && report.comparisonData ? `
                <div class="comparison-stats" style="background: #fff3e0; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #e65100;">📈 Month-over-Month Comparison</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 12px;">
                        <div><strong>Current Month:</strong> ${report.comparisonData.currentMonth.toFixed(2)} kWh</div>
                        <div><strong>Previous Month:</strong> ${report.comparisonData.previousMonth.toFixed(2)} kWh</div>
                        <div style="color: ${report.comparisonData.percentageChange >= 0 ? '#e74c3c' : '#2ecc71'};"><strong>Change:</strong> ${report.comparisonData.percentageChange}%</div>
                    </div>
                </div>
            ` : ''}
            <div class="report-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-primary" data-action="view" data-id="${report._id || report.id}" style="flex: 1; min-width: 120px;">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-success" data-action="export-excel" data-id="${report._id || report.id}" style="flex: 1; min-width: 120px;">
                    <i class="fas fa-file-excel"></i> Download Excel
                </button>
                <button class="btn btn-info" data-action="export-csv" data-id="${report._id || report.id}" style="flex: 1; min-width: 120px;">
                    <i class="fas fa-file-csv"></i> Download CSV
                </button>
                <button class="btn btn-secondary" data-action="delete" data-id="${report._id || report.id}" style="min-width: 100px;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        return item;
    }

    showReportDetail(report) {
        // Group data by device type for charting
        const deviceTypeData = {};
        if (report.data && Array.isArray(report.data)) {
            report.data.forEach(item => {
                const type = item.deviceType || 'Unknown';
                if (!deviceTypeData[type]) {
                    deviceTypeData[type] = 0;
                }
                deviceTypeData[type] += item.consumption;
            });
        }

        // Generate peak hours display
        let peakHoursHtml = '';
        if (report.peakHours && report.peakHours.length > 0) {
            const sortedPeakHours = [...report.peakHours].sort((a, b) => b.consumption - a.consumption);
            peakHoursHtml = `
                <div class="peak-hours-section" style="margin-top: 20px; padding: 15px; background: #fff8dc; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #ff6b6b;">⚡ Peak Usage Hours</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;">
                        ${sortedPeakHours.slice(0, 10).map(ph => `
                            <div style="padding: 10px; background: ${ph.isPeak ? '#ff6b6b' : '#f0f0f0'}; 
                                        color: ${ph.isPeak ? 'white' : 'black'}; border-radius: 6px; text-align: center;">
                                <div style="font-size: 18px; font-weight: bold;">${ph.hour}:00</div>
                                <div style="font-size: 12px;">${ph.consumption.toFixed(2)} kWh</div>
                                ${ph.isPeak ? '<div style="font-size: 10px;">🔥 PEAK</div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const modalHtml = `
            <div class="modal" id="report-detail-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
                <div class="modal-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <h2 style="margin-top: 0;">${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report - ${report.period}</h2>
                    
                    <div class="report-metadata" style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 13px;">
                        <div><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</div>
                        <div><strong>Last Updated:</strong> ${new Date(report.lastUpdated || report.generatedAt).toLocaleString()}</div>
                        <div><strong>Filename:</strong> ${report.filename || 'N/A'}</div>
                        ${report.deviceTypeFilter ? `<div><strong>Filtered by:</strong> ${report.deviceTypeFilter}</div>` : ''}
                    </div>
                    
                    <div class="report-summary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div class="summary-item" style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1976d2;">Total Consumption</h3>
                            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1565c0;">${report.totalConsumption.toFixed(2)} kWh</p>
                        </div>
                        <div class="summary-item" style="background: #ffebee; padding: 15px; border-radius: 8px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #c62828;">Total Cost</h3>
                            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #b71c1c;">$${report.totalCost.toFixed(2)}</p>
                        </div>
                        <div class="summary-item" style="background: #fff3e0; padding: 15px; border-radius: 8px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #e65100;">Cost Estimate</h3>
                            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #d84315;">$${(report.totalConsumption * (report.costPerKwh || 0.12)).toFixed(2)}</p>
                            <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">@ $${(report.costPerKwh || 0.12).toFixed(3)}/kWh</p>
                        </div>
                    </div>
                    
                    ${report.weeklyStats ? `
                        <div class="weekly-stats-detail" style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="margin-top: 0; color: #2e7d32;">📊 Weekly Summary Statistics</h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div><strong>Total:</strong> ${report.weeklyStats.total} kWh</div>
                                <div><strong>Average:</strong> ${report.weeklyStats.avg} kWh</div>
                                <div><strong>Minimum:</strong> ${report.weeklyStats.min} kWh</div>
                                <div><strong>Maximum:</strong> ${report.weeklyStats.max} kWh</div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${report.type === 'comparison' && report.comparisonData ? `
                        <div class="comparison-detail" style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="margin-top: 0; color: #e65100;">📈 Month-over-Month Comparison</h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div><strong>Current Month:</strong> ${report.comparisonData.currentMonth.toFixed(2)} kWh</div>
                                <div><strong>Previous Month:</strong> ${report.comparisonData.previousMonth.toFixed(2)} kWh</div>
                                <div style="grid-column: 1 / -1;">
                                    <strong>Change:</strong> 
                                    <span style="color: ${report.comparisonData.percentageChange >= 0 ? '#e74c3c' : '#2ecc71'}; font-size: 18px; font-weight: bold;">
                                        ${report.comparisonData.percentageChange >= 0 ? '↑' : '↓'} ${Math.abs(report.comparisonData.percentageChange)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${peakHoursHtml}
                    
                    <div class="report-chart-container" style="margin: 20px 0;">
                        <canvas id="report-detail-chart" height="300"></canvas>
                    </div>
                    
                    <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-success" id="export-excel-detail" style="flex: 1;">
                            <i class="fas fa-file-excel"></i> Download Excel
                        </button>
                        <button class="btn btn-info" id="export-csv-detail" style="flex: 1;">
                            <i class="fas fa-file-csv"></i> Download CSV
                        </button>
                        <button class="btn btn-secondary" id="close-report-detail">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Render chart
        this.renderReportChart(report, deviceTypeData);

        // Add event listeners
        document.getElementById('close-report-detail').addEventListener('click', () => {
            document.getElementById('report-detail-modal').remove();
        });

        document.getElementById('export-excel-detail').addEventListener('click', () => {
            ApiService.exportReportExcel(report._id || report.id);
        });

        document.getElementById('export-csv-detail').addEventListener('click', () => {
            ApiService.exportReportCSV(report._id || report.id);
        });

        // Close on background click
        document.getElementById('report-detail-modal').addEventListener('click', (e) => {
            if (e.target.id === 'report-detail-modal') {
                document.getElementById('report-detail-modal').remove();
            }
        });
    }

    renderReportChart(report, deviceTypeData = null) {
        const ctx = document.getElementById('report-detail-chart').getContext('2d');

        // Use provided deviceTypeData or calculate from report.data
        let labels, data;

        if (deviceTypeData && Object.keys(deviceTypeData).length > 0) {
            labels = Object.keys(deviceTypeData);
            data = Object.values(deviceTypeData);
        } else if (report.data && Array.isArray(report.data)) {
            // Group data by device type for charting
            const typeData = {};
            report.data.forEach(item => {
                const type = item.deviceType || 'Unknown';
                if (!typeData[type]) {
                    typeData[type] = 0;
                }
                typeData[type] += item.consumption;
            });
            labels = Object.keys(typeData);
            data = Object.values(typeData);
        } else {
            // Fallback data
            labels = ['No Data'];
            data = [0];
        }

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#3498db',
                        '#e74c3c',
                        '#2ecc71',
                        '#f39c12',
                        '#9b59b6',
                        '#1abc9c',
                        '#d35400'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Energy Consumption by Device Type'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value.toFixed(2)} kWh`;
                            }
                        }
                    }
                }
            }
        });
    }

    showGenerateReportModal() {
        const modalHtml = `
            <div class="modal" id="generate-report-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
                <div class="modal-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
                    <h2 style="margin-top: 0;">Generate New Report</h2>
                    
                    <div style="margin-bottom: 20px;">
                        <label for="report-type" style="display: block; margin-bottom: 8px; font-weight: 500;">Report Type:</label>
                        <select id="report-type" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                            <option value="daily">Daily Report</option>
                            <option value="weekly">Weekly Report</option>
                            <option value="monthly">Monthly Report</option>
                            <option value="yearly">Yearly Report</option>
                            <option value="comparison">Month-over-Month Comparison</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label for="report-device-type" style="display: block; margin-bottom: 8px; font-weight: 500;">Filter by Device Type (Optional):</label>
                        <select id="report-device-type" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                            <option value="">All Devices</option>
                            <option value="lighting">Lighting</option>
                            <option value="heating">Heating</option>
                            <option value="cooling">Cooling (AC)</option>
                            <option value="appliances">Appliances</option>
                            <option value="electronics">Electronics (EV Charger)</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label for="report-cost-kwh" style="display: block; margin-bottom: 8px; font-weight: 500;">Cost per kWh ($):</label>
                        <input type="number" id="report-cost-kwh" class="form-control" value="0.12" step="0.01" min="0" 
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    
                    <div class="modal-actions" style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" id="confirm-generate-report" style="flex: 1;">
                            <i class="fas fa-chart-line"></i> Generate Report
                        </button>
                        <button class="btn btn-secondary" id="cancel-generate-report">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('cancel-generate-report').addEventListener('click', () => {
            document.getElementById('generate-report-modal').remove();
        });

        // Close on background click
        document.getElementById('generate-report-modal').addEventListener('click', (e) => {
            if (e.target.id === 'generate-report-modal') {
                document.getElementById('generate-report-modal').remove();
            }
        });

        return new Promise((resolve) => {
            document.getElementById('confirm-generate-report').addEventListener('click', () => {
                const type = document.getElementById('report-type').value;
                const deviceType = document.getElementById('report-device-type').value || null;
                const costPerKwh = parseFloat(document.getElementById('report-cost-kwh').value) || 0.12;

                document.getElementById('generate-report-modal').remove();
                resolve({ type, deviceType, costPerKwh });
            });
        });
    }
}
>>>>>>> edd6ab99103d2eaf707de84c7e82e804d9e70762
