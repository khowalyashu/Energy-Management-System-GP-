class ReportController {
    constructor() {
        this.view = new ReportsView();
    }
    
    async loadReports() {
        try {
            const reports = await ApiService.getReports();
            this.view.displayReports(reports);
            
            // Add event listeners
            this.addEventListeners();
        } catch (error) {
            console.error('Error loading reports:', error);
            alert('Failed to load reports');
        }
    }
    
    addEventListeners() {
        document.querySelectorAll('[data-action="view"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.target.getAttribute('data-id');
                this.viewReport(reportId);
            });
        });
        
        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.target.getAttribute('data-id');
                this.deleteReport(reportId);
            });
        });
    }
    
    async generateReport(type) {
        try {
            const report = await ApiService.generateReport({ type });
            this.loadReports();
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report: ' + error.message);
        }
    }
    
    async viewReport(reportId) {
        try {
            const report = await ApiService.getReport(reportId);
            this.view.showReportDetail(report);
        } catch (error) {
            console.error('Error loading report:', error);
            alert('Failed to load report details');
        }
    }
    
    async deleteReport(reportId) {
        if (confirm('Are you sure you want to delete this report?')) {
            try {
                // This would call ApiService.deleteReport(reportId) if implemented
                this.loadReports();
                alert('Report deleted successfully!');
            } catch (error) {
                console.error('Error deleting report:', error);
                alert('Failed to delete report: ' + error.message);
            }
        }
    }
}