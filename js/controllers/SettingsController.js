class SettingsController {
    constructor() {
        this.view = new SettingsView();
    }
    
    async updatePreferences() {
        try {
            const preferences = this.view.getPreferences();
            await ApiService.updateProfile({ preferences });
            
            // Update local user data
            const userData = JSON.parse(localStorage.getItem('user'));
            userData.preferences = preferences;
            localStorage.setItem('user', JSON.stringify(userData));
            
            window.myEMSApp.user.preferences = preferences;
            
            this.view.showMessage('Preferences updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating preferences:', error);
            this.view.showMessage('Failed to update preferences: ' + error.message, 'error');
        }
    }
}