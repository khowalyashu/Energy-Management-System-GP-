class User {
    constructor(data) {
        this.id = data._id || data.id || null;
        this.username = data.username || '';
        this.name = data.name || '';
        this.email = data.email || '';
        this.role = data.role || 'user';
        this.preferences = data.preferences || {
            notifications: true,
            darkMode: false,
            dataRefresh: 5
        };
    }
    
    isAdmin() {
        return this.role === 'admin';
    }
}