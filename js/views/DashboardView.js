class DashboardView {
    constructor() {
        this.energyValue = document.getElementById('energy-value');
        this.costValue = document.getElementById('cost-value');
        this.devicesValue = document.getElementById('devices-value');
        this.savingsValue = document.getElementById('savings-value');
        
        this.energyTrend = document.getElementById('energy-trend');
        this.costTrend = document.getElementById('cost-trend');
        this.devicesTrend = document.getElementById('devices-trend');
        this.savingsTrend = document.getElementById('savings-trend');
    }
    
    updateStats(stats) {
        if (stats.energy) {
            this.energyValue.textContent = `${stats.energy.value.toFixed(2)} kWh`;
            this.updateTrend(this.energyTrend, stats.energy.trend);
        }
        
        if (stats.cost) {
            this.costValue.textContent = `$${stats.cost.value.toFixed(2)}`;
            this.updateTrend(this.costTrend, stats.cost.trend);
        }
        
        if (stats.devices) {
            this.devicesValue.textContent = stats.devices.value;
            this.updateTrend(this.devicesTrend, stats.devices.trend);
        }
        
        if (stats.savings) {
            this.savingsValue.textContent = `$${stats.savings.value.toFixed(2)}`;
            this.updateTrend(this.savingsTrend, stats.savings.trend);
        }
    }
    
    updateTrend(element, trend) {
        element.textContent = trend >= 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`;
        element.className = `stat-trend ${trend >= 0 ? 'positive' : 'negative'}`;
    }
    
    updateEnergyChart(labels, data) {
        if (window.myEMSApp && window.myEMSApp.energyChart) {
            window.myEMSApp.energyChart.data.labels = labels;
            window.myEMSApp.energyChart.data.datasets[0].data = data;
            window.myEMSApp.energyChart.update();
        }
    }
    
    updateDeviceChart(labels, data) {
        if (window.myEMSApp && window.myEMSApp.deviceChart) {
            window.myEMSApp.deviceChart.data.labels = labels;
            window.myEMSApp.deviceChart.data.datasets[0].data = data;
            window.myEMSApp.deviceChart.update();
        }
    }
}