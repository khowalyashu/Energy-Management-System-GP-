(function () {
    const $ = (s) => document.querySelector(s);

    async function renderList() {
        const wrap = $('#userList');
        if (!wrap) return;
        const list = await ApiService.listUsers();
        wrap.innerHTML = list.map((u) => {
            const id = u._id || u.id;
            const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—';
            return `
        <div class="user-card" data-id="${id}">
          <h4>${u.name}</h4>
          <p>Username: ${u.username}</p>
          <p>Email: ${u.email}</p>
          <p>Role: ${u.role}</p>
          <p>Joined: ${joined}</p>
          <div>
            <button class="btn btn-primary edit-user" data-id="${id}">Edit</button>
            <button class="btn btn-danger delete-user" data-id="${id}">Delete</button>
          </div>
        </div>`;
        }).join('');
    }

    function openFormWith(u) {
        const modal = $('#userModal');
        if ($('#userId')) $('#userId').value = u?.id || '';
        if ($('#userName')) $('#userName').value = u?.name || '';
        if ($('#userUsername')) $('#userUsername').value = u?.username || '';
        if ($('#userEmail')) $('#userEmail').value = u?.email || '';
        if ($('#userRole')) $('#userRole').value = u?.role || 'user';
        if (modal) modal.style.display = 'block';
    }

    // Delegated delete
    document.addEventListener('click', async (e) => {
        const delBtn = e.target.closest('.delete-user');
        if (delBtn) {
            const id = delBtn.dataset.id || delBtn.closest('[data-id]')?.dataset.id;
            if (!id) return alert('Missing user id.');
            try { await ApiService.deleteUser(id); await renderList(); }
            catch (err) { alert('Failed to delete user: ' + err.message); }
        }
    });

    // support Add/Edit user form
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = $('#userId')?.value || '';
            const payload = {
                name: $('#userName')?.value.trim() || '',
                username: $('#userUsername')?.value.trim() || '',
                email: $('#userEmail')?.value.trim() || '',
                role: $('#userRole')?.value || 'user',
            };
            try {
                if (id) await ApiService.updateUser(id, payload);
                else await ApiService.createUser ? await ApiService.createUser(payload) : Promise.reject(new Error('createUser not implemented'));
                await renderList();
                if ($('#userModal')) $('#userModal').style.display = 'none';
                userForm.reset();
                if ($('#userId')) $('#userId').value = '';
            } catch (err) { alert('Failed to save user: ' + err.message); }
        });
    }

    window.UserController = {
        loadUsers: renderList,
        showAddUserForm: () => openFormWith(null),
        refresh: renderList,
    };
})();
