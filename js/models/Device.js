class Device {
    constructor(data) {
        this.id = data._id || data.id || null;
        this.name = data.name || '';
        this.type = data.type || '';
        this.powerRating = data.powerRating || 0;
        this.energyConsumption = data.energyConsumption || 0;
        this.status = data.status || 'inactive';
        this.lastActive = data.lastActive ? new Date(data.lastActive) : null;
        this.location = data.location || '';
        this.userId = data.userId || null;
    }
    
    calculateCost(rate = 0.12) {
        return this.energyConsumption * rate;
    }
}