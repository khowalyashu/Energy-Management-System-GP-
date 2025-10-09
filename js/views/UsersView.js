// js/views/UsersView.js
(function () {
  class UsersView {
    constructor() {
      this.grid = document.getElementById('users-grid');
      this.addBtn = document.getElementById('add-user-btn');

      // Modal bits
      this.modal = document.getElementById('user-modal');
      this.titleEl = document.getElementById('user-modal-title');
      this.form = document.getElementById('user-form');
      this.nameEl = document.getElementById('u-name');
      this.usernameEl = document.getElementById('u-username');
      this.emailEl = document.getElementById('u-email');
      this.roleEl = document.getElementById('u-role');
      this.btnCancel = document.getElementById('user-cancel');
      this.btnSave = document.getElementById('user-save');

      this.editingUser = null;

      // Wire events (guards keep things safe even if elements are missing)
      if (this.addBtn) this.addBtn.addEventListener('click', () => this.openCreate());
      if (this.btnCancel) this.btnCancel.addEventListener('click', () => this.close());
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.close();
        });
      }
      if (this.btnSave) this.btnSave.addEventListener('click', () => this.save());

      // Auto-mount when the Users section becomes active
      this.ensureAutoMount();
    }

    ensureAutoMount() {
      const section = document.getElementById('users-content');
      if (!section) return;

      const tryRender = async () => {
        if (section.classList.contains('active')) {
          await this.mount();
          observer.disconnect();
        }
      };

      const observer = new MutationObserver(tryRender);
      observer.observe(section, { attributes: true, attributeFilter: ['class'] });

      // Try immediately in case Users is already active
      tryRender();
    }

    async mount() {
      try {
        const list = await ApiService.users();
        await this.render(list);
      } catch (e) {
        console.error('UsersView mount error:', e);
      }
    }

    async render(users = []) {
      if (!this.grid) return;

      if (!Array.isArray(users) || users.length === 0) {
        this.grid.innerHTML = `
          <div class="no-users">
            <i class="fas fa-users"></i>
            <p>No users yet. Click <strong>Add User</strong> to create one.</p>
          </div>`;
        return;
      }

      const frag = document.createDocumentFragment();
      users.forEach(u => frag.appendChild(this.card(u)));
      this.grid.innerHTML = '';
      this.grid.appendChild(frag);
    }

    card(user) {
      const role = (user.role || 'user').toLowerCase();
      const el = document.createElement('div');
      el.className = 'card user-card';
      el.innerHTML = `
        <div class="user-card__head">
          <div class="user-card__title">${this.esc(user.name || user.username || 'User')}</div>
          <span class="badge ${role === 'admin' ? 'badge-admin' : 'badge-user'}">${role.toUpperCase()}</span>
        </div>
        <div class="user-card__body">
          <div class="kv"><span>Username:</span> <strong>${this.esc(user.username || '-')}</strong></div>
          <div class="kv"><span>Email:</span> ${this.esc(user.email || '-')}</div>
          <div class="kv"><span>Joined:</span> ${user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '-'}</div>
        </div>
        <div class="user-card__actions">
          <button class="btn btn-primary btn-sm" data-act="edit"><i class="fas fa-pen"></i> Edit</button>
          <button class="btn btn-secondary btn-sm" data-act="delete"><i class="fas fa-trash"></i> Delete</button>
        </div>
      `;

      el.querySelector('[data-act="edit"]').addEventListener('click', () => this.openEdit(user));
      el.querySelector('[data-act="delete"]').addEventListener('click', async () => {
        if (!confirm(`Delete user "${user.username || user.name}"?`)) return;
        try {
          await ApiService.deleteUser(user._id);
          const list = await ApiService.users();
          this.render(list);
        } catch (e) {
          alert(e.message || 'Delete failed');
        }
      });

      return el;
    }

    openCreate() {
      this.editingUser = null;
      this.titleEl.textContent = 'Add User';
      this.form && this.form.reset();
      if (this.roleEl) this.roleEl.value = 'user';
      this.show();
    }

    openEdit(user) {
      this.editingUser = user;
      this.titleEl.textContent = 'Edit User';
      this.nameEl.value = user.name || '';
      this.usernameEl.value = user.username || '';
      this.emailEl.value = user.email || '';
      this.roleEl.value = (user.role || 'user').toLowerCase();
      this.show();
    }

    show() {
      if (!this.modal) return;
      this.modal.style.display = 'flex';
      document.body.classList.add('no-scroll');
    }

    close() {
      if (!this.modal) return;
      this.modal.style.display = 'none';
      document.body.classList.remove('no-scroll');
    }

    async save() {
      const name = (this.nameEl.value || '').trim();
      const username = (this.usernameEl.value || '').trim();
      const email = (this.emailEl.value || '').trim();
      const role = this.roleEl.value;

      if (!name || !username) {
        alert('Name and username are required.');
        return;
      }

      try {
        if (this.editingUser) {
          await ApiService.updateUser(this.editingUser._id, { name, username, email, role });
        } else {
          await ApiService.createUser({ name, username, email, role });
        }
        this.close();
        const list = await ApiService.users();
        this.render(list);
      } catch (e) {
        alert(e.message || 'Save failed');
      }
    }

    esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  }

  // create the view immediately (it will auto-mount on first time Users tab becomes active)
  window.usersView = new UsersView();
})();
