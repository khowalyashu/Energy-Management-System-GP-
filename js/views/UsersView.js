class UsersView {
    constructor() {
        this.usersGrid = document.getElementById('users-grid');
    }
    
    displayUsers(users) {
        this.usersGrid.innerHTML = '';
        
        if (users.length === 0) {
            this.usersGrid.innerHTML = `
                <div class="no-users">
                    <i class="fas fa-users"></i>
                    <p>No users found. Add your first user to get started.</p>
                </div>
            `;
            return;
        }
        
        users.forEach(user => {
            const userCard = this.createUserCard(user);
            this.usersGrid.appendChild(userCard);
        });
    }
    
    createUserCard(user) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <div class="user-header">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-info">
                    <h3 class="user-name">${user.name}</h3>
                    <span class="user-role ${user.role}">${user.role}</span>
                </div>
            </div>
            <div class="user-details">
                <div class="user-detail">
                    <span class="detail-label">Username:</span>
                    <span class="detail-value">${user.username}</span>
                </div>
                <div class="user-detail">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${user.email}</span>
                </div>
                <div class="user-detail">
                    <span class="detail-label">Joined:</span>
                    <span class="detail-value">${new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-primary" data-action="edit" data-id="${user._id || user.id}">Edit</button>
                <button class="btn btn-secondary" data-action="delete" data-id="${user._id || user.id}">Delete</button>
            </div>
        `;
        
        return card;
    }
    
    showAddUserForm() {
        const formHtml = `
            <div class="modal" id="add-user-modal">
                <div class="modal-content">
                    <h2>Add New User</h2>
                    <form id="add-user-form">
                        <div class="form-group">
                            <label for="user-name">Full Name</label>
                            <input type="text" id="user-name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="user-username">Username</label>
                            <input type="text" id="user-username" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="user-email">Email</label>
                            <input type="email" id="user-email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="user-password">Password</label>
                            <input type="password" id="user-password" name="password" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="user-role">Role</label>
                            <select id="user-role" name="role" required>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-add-user">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add User</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHtml);
        
        document.getElementById('add-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = Object.fromEntries(formData.entries());
            window.myEMSApp.controllers.user.addUser(userData);
        });
        
        document.getElementById('cancel-add-user').addEventListener('click', () => {
            document.getElementById('add-user-modal').remove();
        });
    }
    
    showEditUserForm(user) {
        const formHtml = `
            <div class="modal" id="edit-user-modal">
                <div class="modal-content">
                    <h2>Edit User</h2>
                    <form id="edit-user-form">
                        <input type="hidden" name="id" value="${user._id || user.id}">
                        <div class="form-group">
                            <label for="edit-user-name">Full Name</label>
                            <input type="text" id="edit-user-name" name="name" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-user-email">Email</label>
                            <input type="email" id="edit-user-email" name="email" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-user-role">Role</label>
                            <select id="edit-user-role" name="role" required>
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-user-password">New Password (leave blank to keep current)</label>
                            <input type="password" id="edit-user-password" name="password" minlength="6">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-edit-user">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHtml);
        
        document.getElementById('edit-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = Object.fromEntries(formData.entries());
            window.myEMSApp.controllers.user.updateUser(userData);
        });
        
        document.getElementById('cancel-edit-user').addEventListener('click', () => {
            document.getElementById('edit-user-modal').remove();
        });
    }
}