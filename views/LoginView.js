class LoginView {
    constructor() {
        this.loginForm = document.getElementById('login-form');
        this.messageElement = document.getElementById('login-message');
    }
    
    showMessage(message, type = 'error') {
        this.messageElement.textContent = message;
        this.messageElement.className = `message ${type}`;
        this.messageElement.style.display = 'block';
        
        setTimeout(() => {
            this.messageElement.style.display = 'none';
        }, 5000);
    }
    
    clearForm() {
        this.loginForm.reset();
    }
    
    setLoading(loading) {
        const submitButton = this.loginForm.querySelector('button[type="submit"]');
        if (loading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    }
}