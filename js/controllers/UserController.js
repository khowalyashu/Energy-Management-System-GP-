// js/controllers/UserController.js
// Self-contained Users controller: ensures grid + modal exist, renders list,


(function () {
  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // ---------- Ensure Users section scaffolding ----------
  function ensureUsersScaffold() {
    // container section 
    const usersSection = $('#users-content') || document.body;

    // Users grid
    let grid = $('#users-grid') || $('#userList');
    if (!grid) {
      grid = document.createElement('div');
      grid.id = 'users-grid';
      grid.className = 'users-grid';
      usersSection.appendChild(grid);
    }

    // Add User button 
    let addBtn = $('#add-user-btn');
    if (!addBtn) {
      addBtn = document.createElement('button');
      addBtn.id = 'add-user-btn';
      addBtn.className = 'btn btn-primary';
      addBtn.style.margin = '0 0 1rem 0';
      addBtn.innerHTML = '<i class="fa fa-user-plus"></i> Add User';
      usersSection.insertBefore(addBtn, grid);
    }
    addBtn.removeAttribute('onclick');

    // Modal
    let modal = $('#userModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'userModal';
      modal.className = 'modal';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="userModalTitle">
          <h2 id="userModalTitle" style="margin:0 0 .75rem 0">Add User</h2>
          <form id="userForm">
            <input type="hidden" id="userId"/>
            <div class="form-grid">
              <div class="form-row full">
                <label>Name</label>
                <input id="userName" class="input" placeholder="e.g., Jane Doe" required />
              </div>
              <div class="form-row two">
                <div>
                  <label>Username</label>
                  <input id="userUsername" class="input" placeholder="e.g., jdoe" required />
                </div>
                <div>
                  <label>Role</label>
                  <select id="userRole" class="input">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div class="form-row full">
                <label>Email</label>
                <input id="userEmail" type="email" class="input" placeholder="e.g., jane@myems.com" />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" id="btnUserCancel" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save User</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }

    return { grid, addBtn, modal };
  }

  // Cached DOM refs
  let grid, addBtn, modal, form, fldId, fldName, fldUsername, fldEmail, fldRole;
  let cache = [];

  // ---------- Modal helpers ----------
  function openForm(user) {
    $('#userModalTitle').textContent = user ? 'Edit User' : 'Add User';

    fldId.value       = user?._id || user?.id || '';
    fldName.value     = user?.name || '';
    fldUsername.value = user?.username || '';
    fldEmail.value    = user?.email || '';
    fldRole.value     = (user?.role || 'user').toLowerCase();

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
    try { fldName.focus(); } catch {}
  }

  function closeForm() {
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    form.reset();
    fldId.value = '';
  }

  // ---------- Render ----------
  async function renderList() {
    cache = await (ApiService.users ? ApiService.users() : ApiService.listUsers());
    if (!Array.isArray(cache)) cache = [];

    if (!cache.length) {
      grid.innerHTML = `
        <div class="no-users">
          <i class="fa fa-users"></i>
          <p>No users yet. Click <strong>Add User</strong> to create one.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = cache.map(u => {
      const id = u._id || u.id || '';
      const joined = u.joinedAt || u.createdAt
        ? new Date(u.joinedAt || u.createdAt).toLocaleDateString()
        : '—';
      const role = (u.role || 'user').toLowerCase();
      const badge = role.toUpperCase();
      const avatar = (u.name || u.username || '?').slice(0,1).toUpperCase();

      return `
        <div class="user-card" data-id="${id}">
          <div class="user-header">
            <div class="user-avatar">${avatar}</div>
            <div class="user-info">
              <h3 class="user-name">${u.name || u.username || 'User'}</h3>
              <span class="user-role ${role}">${badge}</span>
            </div>
          </div>
          <div class="user-details">
            <div class="user-detail"><span class="detail-label">Username:</span><span class="detail-value">${u.username || '-'}</span></div>
            <div class="user-detail"><span class="detail-label">Email:</span><span class="detail-value">${u.email || '-'}</span></div>
            <div class="user-detail"><span class="detail-label">Joined:</span><span class="detail-value">${joined}</span></div>
          </div>
          <div class="user-actions">
            <button class="btn btn-primary edit-user"><i class="fa fa-pen"></i> Edit</button>
            <button class="btn btn-danger delete-user"><i class="fa fa-trash"></i> Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ---------- Event wiring ----------
  function wireEvents() {
    // 1) Kill legacy prompt + open our modal (CAPTURE PHASE).
    document.addEventListener('click', function (e) {
      const targetBtn = e.target.closest('#add-user-btn');
      if (!targetBtn) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation(); 
      openForm(null);
    }, true);

    // 2) Grid actions (edit/delete)
    grid.addEventListener('click', async (e) => {
      const card = e.target.closest('.user-card');
      if (!card) return;
      const id = card.dataset.id;
      if (e.target.closest('.edit-user')) {
        const u = cache.find(x => (x._id || x.id) === id);
        openForm(u || null);
        return;
      }
      if (e.target.closest('.delete-user')) {
        if (!confirm('Delete this user?')) return;
        try {
          await ApiService.deleteUser(id);
          await renderList();
        } catch (err) {
          alert('Failed to delete user: ' + (err?.message || err));
        }
      }
    });

    // 3) Modal cancel
    $('#btnUserCancel').addEventListener('click', (e) => {
      e.preventDefault();
      closeForm();
    });

    // 4) Modal submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = fldId.value.trim();
      const payload = {
        name:     fldName.value.trim(),
        username: fldUsername.value.trim(),
        email:    fldEmail.value.trim(),
        role:     fldRole.value || 'user',
      };
      try {
        if (id) await ApiService.updateUser(id, payload);
        else    await ApiService.createUser(payload);
        await renderList();
        closeForm();
      } catch (err) {
        alert('Failed to save user: ' + (err?.message || err));
      }
    });

    // 5) Close modal on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeForm();
    });
  }

  // ---------- Init ----------
  function init() {
    const bits = ensureUsersScaffold();
    grid  = bits.grid;
    addBtn = bits.addBtn;
    modal = bits.modal;

    form        = $('#userForm');
    fldId       = $('#userId');
    fldName     = $('#userName');
    fldUsername = $('#userUsername');
    fldEmail    = $('#userEmail');
    fldRole     = $('#userRole');

    // Add button never has inline onclick
    addBtn.removeAttribute('onclick');

    wireEvents();
    renderList();
  }

  // Expose minimal API
  window.UserController = {
    loadUsers: renderList,
    showAddUserForm: () => openForm(null),
    refresh: renderList,
  };

  // Kick off when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
