class SettingsView {
    constructor() {
        this.profileForm = document.getElementById('profile-form');
        this.notifications = document.getElementById('notifications');
        this.darkMode = document.getElementById('dark-mode');
        this.dataRefresh = document.getElementById('data-refresh');
    }
    
    loadUserPreferences(user) {
        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-email').value = user.email || '';
        
        if (user.preferences) {
            this.notifications.checked = user.preferences.notifications !== undefined ? user.preferences.notifications : true;
            this.darkMode.checked = user.preferences.darkMode || false;
            this.dataRefresh.value = user.preferences.dataRefresh || 5;
        }
    }
    
    getPreferences() {
        return {
            notifications: this.notifications.checked,
            darkMode: this.darkMode.checked,
            dataRefresh: parseInt(this.dataRefresh.value)
        };
    }
    
    showMessage(message, type = 'success') {
        // Create a temporary message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '1000';
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
        } else {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.border = '1px solid #f5c6cb';
        }
        
        document.body.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }
}