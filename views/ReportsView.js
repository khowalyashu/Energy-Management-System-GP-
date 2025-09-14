class ReportsView {
    constructor() {
        this.reportContainer = document.getElementById('report-container');
    }
    
    displayReports(reports) {
        this.reportContainer.innerHTML = '';
        
        if (reports.length === 0) {
            this.reportContainer.innerHTML = `
                <div class="no-reports">
                    <i class="fas fa-chart-bar"></i>
                    <p>No reports found. Generate your first report to view analytics.</p>
                </div>
            `;
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
        item.innerHTML = `
            <div class="report-header">
                <h3>${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report - ${report.period}</h3>
                <span class="report-date">${new Date(report.generatedAt).toLocaleDateString()}</span>
            </div>
            <div class="report-details">
                <div class="report-stat">
                    <span class="stat-label">Total Consumption:</span>
                    <span class="stat-value">${report.totalConsumption.toFixed(2)} kWh</span>
                </div>
                <div class="report-stat">
                    <span class="stat-label">Total Cost:</span>
                    <span class="stat-value">$${report.totalCost.toFixed(2)}</span>
                </div>
                <div class="report-stat">
                    <span class="stat-label">Data Points:</span>
                    <span class="stat-value">${report.data.length}</span>
                </div>
            </div>
            <div class="report-actions">
                <button class="btn btn-primary" data-action="view" data-id="${report.id}">View Details</button>
                <button class="btn btn-secondary" data-action="delete" data-id="${report.id}">Delete</button>
            </div>
        `;
        
        return item;
    }
    
    showReportDetail(report) {
        const modalHtml = `
            <div class="modal" id="report-detail-modal">
                <div class="modal-content">
                    <h2>${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report - ${report.period}</h2>
                    <div class="report-summary">
                        <div class="summary-item">
                            <h3>Total Consumption</h3>
                            <p>${report.totalConsumption.toFixed(2)} kWh</p>
                        </div>
                        <div class="summary-item">
                            <h3>Total Cost</h3>
                            <p>$${report.totalCost.toFixed(2)}</p>
                        </div>
                        <div class="summary-item">
                            <h3>Generated On</h3>
                            <p>${new Date(report.generatedAt).toLocaleString()}</p>
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
        
        // Render chart
        this.renderReportChart(report);
        
        document.getElementById('close-report-detail').addEventListener('click', () => {
            document.getElementById('report-detail-modal').remove();
        });
    }
    
    renderReportChart(report) {
        const ctx = document.getElementById('report-detail-chart').getContext('2d');
        
        // Group data by device type for charting
        const deviceTypeData = {};
        report.data.forEach(item => {
            if (!deviceTypeData[item.deviceType]) {
                deviceTypeData[item.deviceType] = 0;
            }
            deviceTypeData[item.deviceType] += item.consumption;
        });
        
        const labels = Object.keys(deviceTypeData);
        const data = Object.values(deviceTypeData);
        
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
                    }
                }
            }
        });
    }
}