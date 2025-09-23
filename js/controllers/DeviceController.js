// DeviceController.js — exposes functions your current app.js expects
// Requires ApiService to be loaded first.

(function () {
    const $ = (s) => document.querySelector(s);

    async function renderList() {
        const wrap = $('#deviceList') || $('#devicesList') || $('#deviceCards');
        if (!wrap) return; // page not visible yet
        const list = await ApiService.listDevices();
        wrap.innerHTML = list.map((d) => {
            const id = d._id || d.id; // tolerate either
            return `
        <div class="device-card" data-id="${id}">
          <div class="card-body">
            <h4>${d.name}</h4>
            <p>Type: ${d.type}</p>
            <p>Power Rating: ${d.powerRating} W</p>
            <p>Energy Consumption: ${d.energyConsumption} kWh</p>
            <p>Location: ${d.location || '-'}</p>
            <div class="actions">
              <button class="btn btn-primary edit-device" data-id="${id}">Edit</button>
              <button class="btn btn-danger delete-device" data-id="${id}">Delete</button>
            </div>
          </div>
        </div>`;
        }).join('');
    }

    function openFormWith(d) {
        const modal = $('#deviceModal');
        if ($('#deviceId')) $('#deviceId').value = d?.id || '';
        if ($('#deviceName')) $('#deviceName').value = d?.name || '';
        if ($('#deviceType')) $('#deviceType').value = d?.type || 'lighting';
        if ($('#devicePower')) $('#devicePower').value = d?.powerRating ?? 0;
        if ($('#deviceEnergy')) $('#deviceEnergy').value = d?.energyConsumption ?? 0;
        if ($('#deviceLocation')) $('#deviceLocation').value = d?.location || '';
        if ($('#deviceStatus')) $('#deviceStatus').value = d?.status || 'active';
        if (modal) modal.style.display = 'block';
    }

    // Global, delegated click handlers (works for dynamically rendered cards)
    document.addEventListener('click', async (e) => {
        // Delete
        const delBtn = e.target.closest('.delete-device');
        if (delBtn) {
            const id = delBtn.dataset.id || delBtn.closest('[data-id]')?.dataset.id;
            if (!id) return alert('Missing device id.');
            try { await ApiService.deleteDevice(id); await renderList(); }
            catch (err) { alert('Failed to delete device: ' + err.message); }
            return;
        }

        // Edit
        const editBtn = e.target.closest('.edit-device');
        if (editBtn) {
            const id = editBtn.dataset.id || editBtn.closest('[data-id]')?.dataset.id;
            if (!id) return alert('Missing device id.');
            try {
                const all = await ApiService.listDevices();
                const d = all.find(x => (x._id || x.id) === id);
                if (!d) return alert('Device not found.');
                openFormWith({
                    id,
                    name: d.name, type: d.type,
                    powerRating: d.powerRating,
                    energyConsumption: d.energyConsumption,
                    location: d.location, status: d.status
                });
            } catch (err) { alert('Failed to load device: ' + err.message); }
        }
    });

    // Add/Edit submit
    const form = document.getElementById('deviceForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = $('#deviceId')?.value || '';
            const payload = {
                name: $('#deviceName')?.value.trim() || '',
                type: $('#deviceType')?.value || 'lighting',
                powerRating: Number($('#devicePower')?.value || 0),
                energyConsumption: Number($('#deviceEnergy')?.value || 0),
                location: $('#deviceLocation')?.value.trim() || '',
                status: $('#deviceStatus')?.value || 'active',
            };
            try {
                if (id) await ApiService.updateDevice(id, payload);
                else await ApiService.createDevice(payload);
                await renderList();
                if ($('#deviceModal')) $('#deviceModal').style.display = 'none';
                form.reset();
                if ($('#deviceId')) $('#deviceId').value = '';
            } catch (err) { alert('Failed to save device: ' + err.message); }
        });
    }

    // Export the API your current app.js calls
    window.DeviceController = {
        loadDevices: renderList,
        showAddDeviceForm: () => openFormWith(null),
        refresh: renderList,
    };
})();
