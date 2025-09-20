class AuthController {
    constructor() {
        this.view = new LoginView();
    }
    
    async login(username, password) {
        this.view.setLoading(true);
        
        try {
            const response = await ApiService.login({ username, password });
            
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response));
            
            window.myEMSApp.user = new User(response);
            window.myEMSApp.showView('dashboard');
            window.myEMSApp.updateUserInfo();
            this.view.clearForm();
            
        } catch (error) {
            this.view.showMessage(error.message || 'Invalid username or password', 'error');
        } finally {
            this.view.setLoading(false);
        }
    }
    
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.myEMSApp.user = null;
        window.myEMSApp.showView('login');
    }
    
    async updateProfile(profileData) {
        try {
            const updatedUser = await ApiService.updateProfile(profileData);
            
            const user = JSON.parse(localStorage.getItem('user'));
            const updatedUserData = { ...user, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            
            window.myEMSApp.user = new User(updatedUserData);
            window.myEMSApp.updateUserInfo();
            
            alert('Profile updated successfully!');
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile: ' + error.message);
            return false;
        }
    }
}