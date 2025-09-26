class DataController {
    constructor() {
        this.view = new DashboardView();
    }
    
    async loadEnergyData() {
        try {
            const energyData = await ApiService.getEnergyData();
            const stats = await ApiService.getEnergyStats();
            
            this.view.updateStats({
                energy: {
                    value: stats.totalConsumption || 0,
                    trend: 2.5
                },
                cost: {
                    value: stats.totalCost || 0,
                    trend: 1.8
                },
                devices: {
                    value: 15,
                    trend: 5.2
                },
                savings: {
                    value: 45.7,
                    trend: -3.1
                }
            });
            
            // Update charts with sample data
            const now = new Date();
            const labels = [];
            const data = [];
            
            for (let i = 0; i < 24; i++) {
                const time = new Date(now);
                time.setHours(now.getHours() - 23 + i);
                labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                data.push(5 + Math.random() * 10);
            }
            
            this.view.updateEnergyChart(labels, data);
            
            // Update device chart
            const deviceLabels = ['Lighting', 'Heating', 'Cooling', 'Appliances', 'Electronics'];
            const deviceData = [12.5, 28.3, 35.7, 18.9, 8.2];
            this.view.updateDeviceChart(deviceLabels, deviceData);
            
            // Update device type breakdown
            document.querySelectorAll('.device-type-value').forEach((element, index) => {
                element.textContent = deviceData[index].toFixed(1) + ' kWh';
            });
            
        } catch (error) {
            console.error('Error loading energy data:', error);
            
            // Use sample data if API fails
            this.view.updateStats({
                energy: {
                    value: 243.4,
                    trend: 2.5
                },
                cost: {
                    value: 27.34,
                    trend: 1.8
                },
                devices: {
                    value: 15,
                    trend: 5.2
                },
                savings: {
                    value: 45.7,
                    trend: -3.1
                }
            });
        }
    }
    
    async loadDeviceStats() {
        // This would typically load device-specific stats
        // For now, we'll just use the data from loadEnergyData
    }
}