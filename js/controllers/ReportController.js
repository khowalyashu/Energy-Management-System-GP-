class ReportController {
    constructor() {
        this.view = new ReportsView();
        this.currentFilters = {
            deviceType: '',
            search: ''
        };
    }

    async loadReports() {
        try {
            const reports = await ApiService.reports(this.currentFilters);
            this.view.displayReports(reports);

            // Add event listeners
            this.addEventListeners();
        } catch (error) {
            console.error('Error loading reports:', error);
            alert('Failed to load reports');
        }
    }

    addEventListeners() {
        // Filter event listeners
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Search on Enter key
        const searchInput = document.getElementById('report-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters();
                }
            });
        }

        // View buttons
        document.querySelectorAll('[data-action="view"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.target.closest('button').getAttribute('data-id');
                this.viewReport(reportId);
            });
        });

        // Export Excel buttons
        document.querySelectorAll('[data-action="export-excel"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.target.closest('button').getAttribute('data-id');
                this.exportExcel(reportId);
            });
        });

        // Export CSV buttons
        document.querySelectorAll('[data-action="export-csv"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.target.closest('button').getAttribute('data-id');
                this.exportCSV(reportId);
            });
        });

        // Delete buttons
        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.target.closest('button').getAttribute('data-id');
                this.deleteReport(reportId);
            });
        });
    }

    async applyFilters() {
        const deviceTypeFilter = document.getElementById('device-type-filter');
        const searchInput = document.getElementById('report-search');

        this.currentFilters = {
            deviceType: deviceTypeFilter ? deviceTypeFilter.value : '',
            search: searchInput ? searchInput.value : ''
        };

        await this.loadReports();
    }

    async generateReport() {
        try {
            // Show modal to get report options
            const options = await this.view.showGenerateReportModal();

            const report = await ApiService.generateReport(options);

            await this.loadReports();

            alert(`${options.type.charAt(0).toUpperCase() + options.type.slice(1)} report generated successfully!`);
        } catch (error) {
            console.error('Error generating report:', error);

            // Check if it's a "no data" error
            if (error.message && error.message.includes('No energy data available')) {
                alert('Error: ' + error.message);
            } else {
                alert('Failed to generate report: ' + (error.message || 'Unknown error'));
            }
        }
    }

    async viewReport(reportId) {
        try {
            const report = await ApiService.getReport(reportId);

            if (!report) {
                alert('Error: Report data is missing or could not be loaded.');
                return;
            }

            this.view.showReportDetail(report);
        } catch (error) {
            console.error('Error loading report:', error);
            alert('Error: Failed to load report details. The report data may be missing or corrupted.');
        }
    }

    exportExcel(reportId) {
        try {
            ApiService.exportReportExcel(reportId);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Failed to export Excel file');
        }
    }

    exportCSV(reportId) {
        try {
            ApiService.exportReportCSV(reportId);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export CSV file');
        }
    }

    async deleteReport(reportId) {
        if (confirm('Are you sure you want to delete this report?')) {
            try {
                await ApiService.deleteReport(reportId);
                await this.loadReports();
                alert('Report deleted successfully!');
            } catch (error) {
                console.error('Error deleting report:', error);
                alert('Failed to delete report: ' + error.message);
            }
        }
    }
}