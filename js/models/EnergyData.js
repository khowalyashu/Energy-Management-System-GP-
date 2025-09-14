class EnergyData {
    constructor(data) {
        this.id = data._id || data.id || null;
        this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
        this.consumption = data.consumption || 0;
        this.cost = data.cost || 0;
        this.deviceId = data.deviceId || null;
        this.deviceType = data.deviceType || '';
        this.userId = data.userId || null;
    }
    
    calculateCost(rate = 0.12) {
        return this.consumption * rate;
    }
}