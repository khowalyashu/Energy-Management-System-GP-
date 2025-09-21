class UserController {
    constructor() {
        this.view = new UsersView();
    }
    
    async loadUsers() {
        try {
            // Check if user is admin
            if (!window.myEMSApp.user.isAdmin()) {
                alert('Access denied. Admin privileges required.');
                return;
            }
            
            const users = await ApiService.getUsers();
            this.view.displayUsers(users);
            
            // Add event listeners
            this.addEventListeners();
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users: ' + error.message);
        }
    }
    
    addEventListeners() {
        document.querySelectorAll('[data-action="edit"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.target.getAttribute('data-id');
                this.editUser(userId);
            });
        });
        
        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.target.getAttribute('data-id');
                this.deleteUser(userId);
            });
        });
    }
    
    async addUser(userData) {
        try {
            // Check if user is admin
            if (!window.myEMSApp.user.isAdmin()) {
                alert('Access denied. Admin privileges required.');
                return;
            }
            
            await ApiService.createUser(userData);
            document.getElementById('add-user-modal').remove();
            this.loadUsers();
            alert('User added successfully!');
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user: ' + error.message);
        }
    }
    
    async editUser(userId) {
        try {
            // Check if user is admin
            if (!window.myEMSApp.user.isAdmin()) {
                alert('Access denied. Admin privileges required.');
                return;
            }
            
            const user = await ApiService.getUser(userId);
            this.view.showEditUserForm(user);
        } catch (error) {
            console.error('Error loading user:', error);
            alert('Failed to load user details');
        }
    }
    
    async updateUser(userData) {
        try {
            // Check if user is admin
            if (!window.myEMSApp.user.isAdmin()) {
                alert('Access denied. Admin privileges required.');
                return;
            }
            
            // Remove password field if empty
            if (!userData.password) {
                delete userData.password;
            }
            
            await ApiService.updateUser(userData.id, userData);
            document.getElementById('edit-user-modal').remove();
            this.loadUsers();
            alert('User updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user: ' + error.message);
        }
    }
    
    async deleteUser(userId) {
        // Check if user is admin
        if (!window.myEMSApp.user.isAdmin()) {
            alert('Access denied. Admin privileges required.');
            return;
        }
        
        // Prevent self-deletion
        if (userId === window.myEMSApp.user.id) {
            alert('You cannot delete your own account.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await ApiService.deleteUser(userId);
                this.loadUsers();
                alert('User deleted successfully!');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user: ' + error.message);
            }
        }
    }
    
    showAddUserForm() {
        // Check if user is admin
        if (!window.myEMSApp.user.isAdmin()) {
            alert('Access denied. Admin privileges required.');
            return;
        }
        
        this.view.showAddUserForm();
    }
}