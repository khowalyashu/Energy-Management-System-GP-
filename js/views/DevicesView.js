class DevicesView {
    constructor() {
        this.devicesGrid = document.getElementById('devices-grid');
    }
    
    displayDevices(devices) {
        this.devicesGrid.innerHTML = '';
        
        if (devices.length === 0) {
            this.devicesGrid.innerHTML = `
                <div class="no-devices">
                    <i class="fas fa-microchip"></i>
                    <p>No devices found. Add your first device to start monitoring.</p>
                </div>
            `;
            return;
        }
        
        devices.forEach(device => {
            const deviceCard = this.createDeviceCard(device);
            this.devicesGrid.appendChild(deviceCard);
        });
    }
    
    createDeviceCard(device) {
        const card = document.createElement('div');
        card.className = 'device-card';
        card.innerHTML = `
            <div class="device-header">
                <h3 class="device-name">${device.name}</h3>
                <span class="device-status ${device.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${device.status}
                </span>
            </div>
            <div class="device-details">
                <div class="device-detail">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${device.type}</span>
                </div>
                <div class="device-detail">
                    <span class="detail-label">Power Rating:</span>
                    <span class="detail-value">${device.powerRating} W</span>
                </div>
                <div class="device-detail">
                    <span class="detail-label">Energy Consumption:</span>
                    <span class="detail-value">${device.energyConsumption.toFixed(2)} kWh</span>
                </div>
                <div class="device-detail">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${device.location}</span>
                </div>
                <div class="device-detail">
                    <span class="detail-label">Last Active:</span>
                    <span class="detail-value">${device.lastActive ? new Date(device.lastActive).toLocaleDateString() : 'Never'}</span>
                </div>
            </div>
            <div class="device-actions">
                <button class="btn btn-primary" data-action="edit" data-id="${device.id}">Edit</button>
                <button class="btn btn-secondary" data-action="delete" data-id="${device.id}">Delete</button>
            </div>
        `;
        
        return card;
    }
    
    showAddDeviceForm() {
        const formHtml = `
            <div class="modal" id="add-device-modal">
                <div class="modal-content">
                    <h2>Add New Device</h2>
                    <form id="add-device-form">
                        <div class="form-group">
                            <label for="device-name">Device Name</label>
                            <input type="text" id="device-name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="device-type">Device Type</label>
                            <select id="device-type" name="type" required>
                                <option value="lighting">Lighting</option>
                                <option value="heating">Heating</option>
                                <option value="cooling">Cooling</option>
                                <option value="appliances">Appliances</option>
                                <option value="electronics">Electronics</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="device-power">Power Rating (W)</label>
                            <input type="number" id="device-power" name="powerRating" required min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="device-location">Location</label>
                            <input type="text" id="device-location" name="location" required>
                        </div>
                        <div class="form-group">
                            <label for="device-status">Status</label>
                            <select id="device-status" name="status" required>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-add-device">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Device</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHtml);
        
        document.getElementById('add-device-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const deviceData = Object.fromEntries(formData.entries());
            deviceData.powerRating = parseFloat(deviceData.powerRating);
            window.myEMSApp.controllers.device.addDevice(deviceData);
        });
        
        document.getElementById('cancel-add-device').addEventListener('click', () => {
            document.getElementById('add-device-modal').remove();
        });
    }
    
    showEditDeviceForm(device) {
        const formHtml = `
            <div class="modal" id="edit-device-modal">
                <div class="modal-content">
                    <h2>Edit Device</h2>
                    <form id="edit-device-form">
                        <input type="hidden" name="id" value="${device.id}">
                        <div class="form-group">
                            <label for="edit-device-name">Device Name</label>
                            <input type="text" id="edit-device-name" name="name" value="${device.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-device-type">Device Type</label>
                            <select id="edit-device-type" name="type" required>
                                <option value="lighting" ${device.type === 'lighting' ? 'selected' : ''}>Lighting</option>
                                <option value="heating" ${device.type === 'heating' ? 'selected' : ''}>Heating</option>
                                <option value="cooling" ${device.type === 'cooling' ? 'selected' : ''}>Cooling</option>
                                <option value="appliances" ${device.type === 'appliances' ? 'selected' : ''}>Appliances</option>
                                <option value="electronics" ${device.type === 'electronics' ? 'selected' : ''}>Electronics</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-device-power">Power Rating (W)</label>
                            <input type="number" id="edit-device-power" name="powerRating" value="${device.powerRating}" required min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="edit-device-location">Location</label>
                            <input type="text" id="edit-device-location" name="location" value="${device.location}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-device-status">Status</label>
                            <select id="edit-device-status" name="status" required>
                                <option value="active" ${device.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${device.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="maintenance" ${device.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-edit-device">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHtml);
        
        document.getElementById('edit-device-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const deviceData = Object.fromEntries(formData.entries());
            deviceData.powerRating = parseFloat(deviceData.powerRating);
            window.myEMSApp.controllers.device.updateDevice(deviceData);
        });
        
        document.getElementById('cancel-edit-device').addEventListener('click', () => {
            document.getElementById('edit-device-modal').remove();
        });
    }
}

// export default DevicesView;