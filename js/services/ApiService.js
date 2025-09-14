class ApiService {
    static baseUrl = '/api';
    
    static async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
        };
        
        const config = { ...defaultOptions, ...options };
        
        if (config.body) {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Auth methods
    static async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
    }
    
    static async getProfile() {
        return this.request('/auth/profile');
    }
    
    static async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: profileData
        });
    }
    
    // Energy data methods
    static async getEnergyData(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/energy?${queryString}`);
    }
    
    static async getEnergyStats(period = 'day') {
        return this.request(`/energy/stats?period=${period}`);
    }
    
    // Device methods
    static async getDevices() {
        return this.request('/devices');
    }
    
    static async getDevice(id) {
        return this.request(`/devices/${id}`);
    }
    
    static async addDevice(deviceData) {
        return this.request('/devices', {
            method: 'POST',
            body: deviceData
        });
    }
    
    static async updateDevice(id, deviceData) {
        return this.request(`/devices/${id}`, {
            method: 'PUT',
            body: deviceData
        });
    }
    
    static async deleteDevice(id) {
        return this.request(`/devices/${id}`, {
            method: 'DELETE'
        });
    }
    
    // Report methods
    static async generateReport(reportData) {
        return this.request('/reports/generate', {
            method: 'POST',
            body: reportData
        });
    }
    
    static async getReports() {
        return this.request('/reports');
    }
    
    // User methods (admin only)
    static async getUsers() {
        return this.request('/users');
    }
    
    static async getUser(id) {
        return this.request(`/users/${id}`);
    }
    
    static async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: userData
        });
    }
    
    static async updateUser(id, userData) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: userData
        });
    }
    
    static async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }
}

// export default ApiService;